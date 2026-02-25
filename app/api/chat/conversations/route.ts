import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth/validateSession'
import { validateProjectAccess } from '@/lib/auth/validateProjectAccess'
import { adminDb } from '@/lib/firebase/admin'

// GET /api/chat/conversations?projectId=X&search=keyword
export async function GET(request: NextRequest) {
  const sessionUser = await validateSession(request)
  if (!sessionUser) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const search = searchParams.get('search')?.toLowerCase()

  if (!projectId) {
    return NextResponse.json({ error: 'Se requiere projectId' }, { status: 400 })
  }

  const access = await validateProjectAccess(sessionUser.uid, projectId)
  if (!access) {
    return NextResponse.json({ error: 'No tienes acceso a este proyecto' }, { status: 403 })
  }

  try {
    const snapshot = await adminDb
      .ref('conversations')
      .orderByChild('projectId')
      .equalTo(projectId)
      .once('value')

    const data = snapshot.val() || {}
    let conversations = Object.entries(data)
      .map(([id, conv]: [string, any]) => ({
        id,
        ...conv,
      }))
      .filter((c: any) => c.userId === sessionUser.uid)
      .sort((a: any, b: any) => b.updatedAt - a.updatedAt)

    if (search) {
      conversations = conversations.filter((c: any) =>
        c.title?.toLowerCase().includes(search) ||
        c.firstMessage?.toLowerCase().includes(search)
      )
    }

    return NextResponse.json(conversations)
  } catch (error: any) {
    console.error('Error listing conversations:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/chat/conversations
export async function POST(request: NextRequest) {
  const sessionUser = await validateSession(request)
  if (!sessionUser) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  let body: { projectId: string; title?: string; messages?: any[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { projectId, title, messages } = body
  if (!projectId) {
    return NextResponse.json({ error: 'Se requiere projectId' }, { status: 400 })
  }

  const access = await validateProjectAccess(sessionUser.uid, projectId)
  if (!access) {
    return NextResponse.json({ error: 'No tienes acceso a este proyecto' }, { status: 403 })
  }

  try {
    const now = Date.now()
    const convRef = adminDb.ref('conversations').push()

    const firstUserMsg = messages?.find(m => m.role === 'user')

    const conversation = {
      projectId,
      userId: sessionUser.uid,
      userName: sessionUser.displayName,
      title: title || firstUserMsg?.content?.slice(0, 80) || 'Nueva conversación',
      firstMessage: firstUserMsg?.content?.slice(0, 150) || '',
      messageCount: messages?.length || 0,
      createdAt: now,
      updatedAt: now,
    }

    await convRef.set(conversation)

    // Save messages if provided
    if (messages && messages.length > 0) {
      const messagesData: Record<string, any> = {}
      messages.forEach((msg: any) => {
        messagesData[msg.id] = {
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        }
      })
      await adminDb.ref(`conversationMessages/${convRef.key}`).set(messagesData)
    }

    return NextResponse.json({ id: convRef.key, ...conversation })
  } catch (error: any) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
