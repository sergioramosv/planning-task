import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth/validateSession'
import { validateProjectAccess } from '@/lib/auth/validateProjectAccess'
import { createChatModel, buildSystemPrompt, executeFunctionCall } from '@/lib/services/chat.service'
import { getProject, listMembers } from '@/lib/services/ai-tools.service'
import { getAvailableModelConfig, trackModelRequest, getTotalQuotaStatus } from '@/lib/services/model-pool'
import type { Content } from '@google/generative-ai'

const MAX_FUNCTION_CALLS = 10

export async function POST(request: NextRequest) {
  // 1. Validate session
  const sessionUser = await validateSession(request)
  if (!sessionUser) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // 2. Parse body
  let body: { message: string; projectId: string; history?: any[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { message, projectId, history } = body
  if (!message || !projectId) {
    return NextResponse.json({ error: 'Se requiere message y projectId' }, { status: 400 })
  }

  // 3. Get available model from pool
  const modelConfig = getAvailableModelConfig()
  if (!modelConfig) {
    const totalStatus = getTotalQuotaStatus()
    return NextResponse.json(
      {
        error: `Todos los modelos han alcanzado su límite. ${totalStatus.activeConfigs}/${totalStatus.totalConfigs} configuraciones disponibles. Intenta más tarde.`,
      },
      { status: 429 }
    )
  }

  // 4. Validate project access
  const access = await validateProjectAccess(sessionUser.uid, projectId)
  if (!access) {
    return NextResponse.json({ error: 'No tienes acceso a este proyecto' }, { status: 403 })
  }

  try {
    // Track this request
    const quotaStatus = trackModelRequest(modelConfig.id)
    if (!quotaStatus) {
      return NextResponse.json({ error: 'Error tracking quota' }, { status: 500 })
    }

    // 6. Load context
    const project = await getProject(projectId)
    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 })
    }
    const members = await listMembers(projectId)

    // 7. Build system prompt and model with selected config
    const systemPrompt = buildSystemPrompt(project, sessionUser.displayName, members)
    const model = createChatModel(modelConfig.apiKey, modelConfig.modelName)

    // 6. Build conversation history
    const chatHistory: Content[] = []

    // Add previous messages if any
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user') {
          chatHistory.push({ role: 'user', parts: [{ text: msg.content }] })
        } else if (msg.role === 'assistant') {
          chatHistory.push({ role: 'model', parts: [{ text: msg.content }] })
        }
      }
    }

    // 7. Create chat session
    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: { role: 'user', parts: [{ text: systemPrompt }] },
    })

    // 8. Send user message and handle function calling loop
    let response = await chat.sendMessage(message)
    let functionCallCount = 0

    while (functionCallCount < MAX_FUNCTION_CALLS) {
      const candidate = response.response.candidates?.[0]
      if (!candidate) break

      const functionCalls = candidate.content?.parts?.filter(p => p.functionCall)
      if (!functionCalls || functionCalls.length === 0) break

      // Execute all function calls
      const functionResponses = []
      for (const part of functionCalls) {
        const fc = part.functionCall!
        const result = await executeFunctionCall(fc.name, fc.args || {}, {
          uid: sessionUser.uid,
          projectId,
          userName: sessionUser.displayName,
        })

        functionResponses.push({
          functionResponse: {
            name: fc.name,
            response: { result: JSON.stringify(result) },
          },
        })
        functionCallCount++
      }

      // Send function results back to model
      response = await chat.sendMessage(functionResponses)
    }

    // 9. Extract final text response
    const finalText = response.response.text()

    // 10. Return as streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Send the response in chunks for streaming effect
        const chunkSize = 20
        let offset = 0

        function pushChunk() {
          if (offset >= finalText.length) {
            controller.close()
            return
          }
          const chunk = finalText.slice(offset, offset + chunkSize)
          controller.enqueue(encoder.encode(chunk))
          offset += chunkSize
          // Small delay for streaming effect
          setTimeout(pushChunk, 10)
        }

        pushChunk()
      },
    })

    // Get total quota status across all configs
    const totalStatus = getTotalQuotaStatus()

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
        'X-RateLimit-RPM-Remaining': totalStatus.rpm.remaining.toString(),
        'X-RateLimit-RPM-Limit': totalStatus.rpm.limit.toString(),
        'X-RateLimit-RPM-Reset': quotaStatus.rpm.resetIn.toString(),
        'X-RateLimit-RPD-Remaining': totalStatus.rpd.remaining.toString(),
        'X-RateLimit-RPD-Limit': totalStatus.rpd.limit.toString(),
        'X-RateLimit-RPD-Reset': quotaStatus.rpd.resetIn.toString(),
        'X-Model-Used': quotaStatus.modelName,
        'X-Model-Config': quotaStatus.configId,
      },
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
