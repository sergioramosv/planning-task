import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth/validateSession'
import { adminDb } from '@/lib/firebase/admin'

// GET /api/chat/conversations/[conversationId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const sessionUser = await validateSession(request)
  if (!sessionUser) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { conversationId } = await params

  try {
    const convSnap = await adminDb.ref(`conversations/${conversationId}`).once('value')
    const conversation = convSnap.val()

    if (!conversation) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
    }

    if (conversation.userId !== sessionUser.uid) {
      return NextResponse.json({ error: 'No tienes acceso a esta conversación' }, { status: 403 })
    }

    const msgsSnap = await adminDb.ref(`conversationMessages/${conversationId}`).once('value')
    const messagesData = msgsSnap.val() || {}

    const messages = Object.entries(messagesData)
      .map(([id, msg]: [string, any]) => ({
        id,
        ...msg,
      }))
      .sort((a: any, b: any) => a.timestamp - b.timestamp)

    return NextResponse.json({
      id: conversationId,
      ...conversation,
      messages,
    })
  } catch (error: any) {
    console.error('Error getting conversation:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE /api/chat/conversations/[conversationId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const sessionUser = await validateSession(request)
  if (!sessionUser) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { conversationId } = await params

  try {
    const convSnap = await adminDb.ref(`conversations/${conversationId}`).once('value')
    const conversation = convSnap.val()

    if (!conversation) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
    }

    if (conversation.userId !== sessionUser.uid) {
      return NextResponse.json({ error: 'No tienes acceso a esta conversación' }, { status: 403 })
    }

    await adminDb.ref(`conversations/${conversationId}`).remove()
    await adminDb.ref(`conversationMessages/${conversationId}`).remove()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PUT /api/chat/conversations/[conversationId] - Update messages
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const sessionUser = await validateSession(request)
  if (!sessionUser) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { conversationId } = await params

  let body: { messages?: any[]; title?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  try {
    const convSnap = await adminDb.ref(`conversations/${conversationId}`).once('value')
    const conversation = convSnap.val()

    if (!conversation) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
    }

    if (conversation.userId !== sessionUser.uid) {
      return NextResponse.json({ error: 'No tienes acceso a esta conversación' }, { status: 403 })
    }

    const updates: Record<string, any> = {
      updatedAt: Date.now(),
    }

    if (body.title) {
      updates.title = body.title
    }

    if (body.messages && body.messages.length > 0) {
      updates.messageCount = body.messages.length

      const firstUserMsg = body.messages.find(m => m.role === 'user')
      if (firstUserMsg && !conversation.firstMessage) {
        updates.firstMessage = firstUserMsg.content.slice(0, 150)
      }
      if (!body.title && !conversation.title) {
        updates.title = firstUserMsg?.content?.slice(0, 80) || 'Nueva conversación'
      }

      // Save all messages
      const messagesData: Record<string, any> = {}
      body.messages.forEach((msg: any) => {
        messagesData[msg.id] = {
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        }
      })
      await adminDb.ref(`conversationMessages/${conversationId}`).set(messagesData)
    }

    await adminDb.ref(`conversations/${conversationId}`).update(updates)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating conversation:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
