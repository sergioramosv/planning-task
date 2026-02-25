import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth/validateSession'
import { validateProjectAccess } from '@/lib/auth/validateProjectAccess'
import { createChatModel } from '@/lib/services/chat.service'
import { getAvailableModelConfig, trackModelRequest } from '@/lib/services/model-pool'

const SYSTEM_PROMPT = `Eres un asistente experto en gestión de proyectos Scrum/Agile.
Tu tarea es generar User Stories, puntos y criterios de aceptación a partir de un título de tarea.

REGLAS:
- Responde SIEMPRE en español
- Los puntos DEBEN ser valores Fibonacci
- bizPoints (valor de negocio): 1, 2, 3, 5, 8, 13
- devPoints (esfuerzo de desarrollo): 1, 2, 3, 5, 8, 13
- La User Story debe seguir el formato: Como [quién], quiero [qué], para [por qué]
- Los criterios de aceptación deben ser claros, verificables y específicos
- Genera entre 3 y 5 criterios de aceptación
- Responde SOLO con JSON válido, sin markdown ni texto adicional

Formato de respuesta (JSON puro):
{
  "userStory": {
    "who": "Como [rol del usuario]",
    "what": "quiero [funcionalidad]",
    "why": "para [beneficio]"
  },
  "bizPoints": 5,
  "devPoints": 3,
  "acceptanceCriteria": [
    "Criterio 1",
    "Criterio 2",
    "Criterio 3"
  ]
}`

export async function POST(request: NextRequest) {
  const sessionUser = await validateSession(request)
  if (!sessionUser) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let body: { title: string; projectId: string; context?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { title, projectId, context } = body
  if (!title || !projectId) {
    return NextResponse.json({ error: 'Se requiere title y projectId' }, { status: 400 })
  }

  const access = await validateProjectAccess(sessionUser.uid, projectId)
  if (!access) {
    return NextResponse.json({ error: 'No tienes acceso a este proyecto' }, { status: 403 })
  }

  const modelConfig = getAvailableModelConfig()
  if (!modelConfig) {
    return NextResponse.json(
      { error: 'El asistente está ocupado. Intenta de nuevo en unos minutos.' },
      { status: 429 }
    )
  }

  try {
    trackModelRequest(modelConfig.id)

    const model = createChatModel(modelConfig.apiKey, modelConfig.modelName)
    const chat = model.startChat({
      systemInstruction: { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
    })

    const userMessage = context
      ? `Genera la User Story, puntos y criterios de aceptación para esta tarea:\n\nTítulo: "${title}"\nContexto adicional: ${context}`
      : `Genera la User Story, puntos y criterios de aceptación para esta tarea:\n\nTítulo: "${title}"`

    const response = await chat.sendMessage(userMessage)
    const text = response.response.text()

    // Parse JSON from response (strip markdown code blocks if present)
    const jsonStr = text.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(jsonStr)

    // Validate Fibonacci values
    const validFib = [1, 2, 3, 5, 8, 13]
    const bizPoints = validFib.includes(parsed.bizPoints) ? parsed.bizPoints : 3
    const devPoints = validFib.includes(parsed.devPoints) ? parsed.devPoints : 3

    return NextResponse.json({
      userStory: {
        who: parsed.userStory?.who || '',
        what: parsed.userStory?.what || '',
        why: parsed.userStory?.why || '',
      },
      bizPoints,
      devPoints,
      acceptanceCriteria: Array.isArray(parsed.acceptanceCriteria)
        ? parsed.acceptanceCriteria.filter((c: any) => typeof c === 'string' && c.trim())
        : [''],
    })
  } catch (error: any) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Error al generar con IA. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
