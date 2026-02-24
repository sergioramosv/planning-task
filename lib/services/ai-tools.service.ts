import { adminDb } from '@/lib/firebase/admin'
import { calculatePriority } from '@/lib/utils/calculations'
import { NotificationAdminService } from './notification-admin.service'

// ============================================================
// HELPERS
// ============================================================

async function getAll(path: string): Promise<any[]> {
  const snap = await adminDb.ref(path).once('value')
  const data = snap.val()
  if (!data) return []
  return Object.entries(data).map(([id, val]: [string, any]) => ({ id, ...val }))
}

async function getById(path: string, id: string): Promise<any | null> {
  const snap = await adminDb.ref(`${path}/${id}`).once('value')
  const data = snap.val()
  if (!data) return null
  return { id, ...data }
}

// ============================================================
// PROJECTS (read-only from chat)
// ============================================================

export async function listProjects(uid: string) {
  const projects = await getAll('projects')
  return projects.filter(p => p.members && (p.members[uid] === true || typeof p.members[uid] === 'object'))
}

export async function getProject(projectId: string) {
  return getById('projects', projectId)
}

// ============================================================
// SPRINTS
// ============================================================

export async function listSprints(projectId: string) {
  const sprints = await getAll('sprints')
  return sprints
    .filter(s => s.projectId === projectId)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export async function getSprint(sprintId: string, includeTasks?: boolean) {
  const sprint = await getById('sprints', sprintId)
  if (!sprint) return null

  if (includeTasks) {
    const tasks = await getAll('tasks')
    sprint.tasks = tasks
      .filter((t: any) => t.sprintId === sprintId)
      .sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0))
    sprint.taskCount = sprint.tasks.length
    sprint.completedTasks = sprint.tasks.filter((t: any) => t.status === 'done').length
  }

  return sprint
}

export async function createSprint(
  data: { name: string; projectId: string; startDate: string; endDate: string; status?: string },
  uid: string
) {
  if (new Date(data.endDate) <= new Date(data.startDate)) {
    return { error: 'La fecha de fin debe ser posterior a la de inicio' }
  }

  const sprintRef = adminDb.ref('sprints').push()
  const sprintData = {
    id: sprintRef.key,
    name: data.name,
    projectId: data.projectId,
    startDate: data.startDate,
    endDate: data.endDate,
    status: data.status || 'planned',
    createdAt: Date.now(),
    createdBy: uid,
  }
  await sprintRef.set(sprintData)
  return { id: sprintRef.key, message: `Sprint "${data.name}" creado`, sprint: sprintData }
}

export async function updateSprint(
  sprintId: string,
  updates: { name?: string; startDate?: string; endDate?: string; status?: string }
) {
  const sprint = await getById('sprints', sprintId)
  if (!sprint) return { error: 'Sprint no encontrado' }

  const clean = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined))
  await adminDb.ref(`sprints/${sprintId}`).update(clean)
  return { message: `Sprint "${sprint.name}" actualizado`, updated: clean }
}

// ============================================================
// TASKS
// ============================================================

export async function listTasks(
  projectId: string,
  filters?: { sprintId?: string; status?: string; developer?: string; searchText?: string }
) {
  const tasks = await getAll('tasks')
  let result = tasks.filter(t => t.projectId === projectId)

  if (filters?.sprintId) result = result.filter(t => t.sprintId === filters.sprintId)
  if (filters?.status) result = result.filter(t => t.status === filters.status)
  if (filters?.developer) result = result.filter(t => t.developer === filters.developer)
  if (filters?.searchText) {
    const search = filters.searchText.toLowerCase()
    result = result.filter(t => t.title?.toLowerCase().includes(search))
  }

  return result.sort((a, b) => (b.priority || 0) - (a.priority || 0))
}

export async function getTask(taskId: string) {
  return getById('tasks', taskId)
}

export async function createTask(
  data: {
    title: string
    projectId: string
    sprintId?: string
    userStory: { who: string; what: string; why: string }
    acceptanceCriteria: string[]
    bizPoints: number
    devPoints: number
    developer?: string
    coDeveloper?: string
    startDate?: string
    endDate?: string
    status?: string
    implementationPlan?: any
  },
  uid: string,
  userName: string
) {
  const priority = calculatePriority(data.bizPoints, data.devPoints)
  const now = Date.now()
  const taskRef = adminDb.ref('tasks').push()
  const histRef = adminDb.ref('dummy').push()

  const taskData = {
    id: taskRef.key,
    title: data.title,
    projectId: data.projectId,
    sprintId: data.sprintId || '',
    userStory: data.userStory,
    acceptanceCriteria: data.acceptanceCriteria,
    bizPoints: data.bizPoints,
    devPoints: data.devPoints,
    priority,
    developer: data.developer || '',
    coDeveloper: data.coDeveloper || '',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    status: data.status || 'to-do',
    implementationPlan: data.implementationPlan || null,
    attachments: [],
    createdAt: now,
    updatedAt: now,
    createdBy: uid,
    createdByName: userName,
    history: {
      [histRef.key!]: {
        id: histRef.key,
        timestamp: now,
        userId: uid,
        userName,
        field: 'task',
        oldValue: null,
        newValue: 'Tarea creada',
        action: 'create',
      },
    },
  }

  await taskRef.set(taskData)

  // Notify assigned developer
  if (data.developer && data.developer !== uid) {
    const project = await getById('projects', data.projectId)
    try {
      await NotificationAdminService.notifyTaskAssignment(
        data.developer,
        data.title,
        project?.name || '',
        userName
      )
    } catch (e) {
      console.error('Error sending assignment notification:', e)
    }
  }

  return { id: taskRef.key, message: `Tarea "${data.title}" creada`, task: taskData }
}

export async function updateTask(
  taskId: string,
  updates: Record<string, any>,
  uid: string,
  userName: string
) {
  const task = await getById('tasks', taskId)
  if (!task) return { error: 'Tarea no encontrada' }

  const clean = Object.fromEntries(
    Object.entries(updates).filter(([, v]) => v !== undefined)
  )

  // Recalculate priority if points changed
  if (clean.bizPoints || clean.devPoints) {
    clean.priority = calculatePriority(
      clean.bizPoints || task.bizPoints,
      clean.devPoints || task.devPoints
    )
  }

  clean.updatedAt = Date.now()

  // Add history entries for changed fields
  const historyUpdates: Record<string, any> = {}
  for (const [field, newValue] of Object.entries(clean)) {
    if (field === 'updatedAt' || field === 'priority') continue
    if (task[field] !== newValue) {
      const histRef = adminDb.ref('dummy').push()
      historyUpdates[`tasks/${taskId}/history/${histRef.key}`] = {
        id: histRef.key,
        timestamp: Date.now(),
        userId: uid,
        userName,
        field,
        oldValue: task[field] ?? null,
        newValue,
        action: 'update',
      }
    }
  }

  await adminDb.ref(`tasks/${taskId}`).update(clean)
  if (Object.keys(historyUpdates).length > 0) {
    await adminDb.ref().update(historyUpdates)
  }

  return { message: `Tarea "${task.title}" actualizada`, updated: clean }
}

export async function deleteTask(taskId: string) {
  const task = await getById('tasks', taskId)
  if (!task) return { error: 'Tarea no encontrada' }

  await adminDb.ref(`tasks/${taskId}`).remove()
  // Remove comments for this task
  await adminDb.ref(`comments/${taskId}`).remove()

  return { message: `Tarea "${task.title}" eliminada` }
}

export async function changeTaskStatus(
  taskId: string,
  newStatus: string,
  uid: string,
  userName: string
) {
  const task = await getById('tasks', taskId)
  if (!task) return { error: 'Tarea no encontrada' }

  const oldStatus = task.status
  const now = Date.now()
  const histRef = adminDb.ref('dummy').push()

  await adminDb.ref(`tasks/${taskId}`).update({
    status: newStatus,
    updatedAt: now,
    [`history/${histRef.key}`]: {
      id: histRef.key,
      timestamp: now,
      userId: uid,
      userName,
      field: 'status',
      oldValue: oldStatus,
      newValue: newStatus,
      action: 'update',
    },
  })

  // Notify developer if someone else changed the status
  if (task.developer && task.developer !== uid) {
    const project = await getById('projects', task.projectId)
    try {
      await NotificationAdminService.notifyTaskStatusChange(
        task.developer,
        task.title,
        oldStatus,
        newStatus,
        userName,
        project?.name || ''
      )
    } catch (e) {
      console.error('Error sending status notification:', e)
    }
  }

  return { message: `Tarea "${task.title}": ${oldStatus} → ${newStatus}` }
}

export async function assignTask(
  taskId: string,
  developerId: string,
  uid: string,
  userName: string
) {
  const task = await getById('tasks', taskId)
  if (!task) return { error: 'Tarea no encontrada' }

  const now = Date.now()
  const histRef = adminDb.ref('dummy').push()

  await adminDb.ref(`tasks/${taskId}`).update({
    developer: developerId,
    updatedAt: now,
    [`history/${histRef.key}`]: {
      id: histRef.key,
      timestamp: now,
      userId: uid,
      userName,
      field: 'developer',
      oldValue: task.developer || null,
      newValue: developerId,
      action: 'update',
    },
  })

  // Notify new developer
  if (developerId && developerId !== uid) {
    const project = await getById('projects', task.projectId)
    try {
      await NotificationAdminService.notifyTaskReassignment(
        developerId,
        task.title,
        userName,
        project?.name || ''
      )
    } catch (e) {
      console.error('Error sending reassignment notification:', e)
    }
  }

  return { message: `Tarea "${task.title}" asignada a ${developerId}` }
}

export async function moveTasksToSprint(taskIds: string[], sprintId: string) {
  const updates: Record<string, any> = {}
  for (const taskId of taskIds) {
    updates[`tasks/${taskId}/sprintId`] = sprintId
    updates[`tasks/${taskId}/updatedAt`] = Date.now()
  }
  await adminDb.ref().update(updates)
  return { message: `${taskIds.length} tareas movidas al sprint ${sprintId}` }
}

// ============================================================
// BUGS
// ============================================================

export async function listBugs(
  projectId: string,
  filters?: { status?: string; severity?: string }
) {
  const bugs = await getAll('bugs')
  let result = bugs.filter(b => b.projectId === projectId)
  if (filters?.status) result = result.filter(b => b.status === filters.status)
  if (filters?.severity) result = result.filter(b => b.severity === filters.severity)
  return result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export async function createBug(
  data: { title: string; description: string; projectId: string; severity: string; assignedTo?: string },
  uid: string,
  userName: string
) {
  const bugRef = adminDb.ref('bugs').push()
  const bugData = {
    id: bugRef.key,
    title: data.title,
    description: data.description,
    projectId: data.projectId,
    severity: data.severity,
    status: 'open',
    assignedTo: data.assignedTo || '',
    createdAt: Date.now(),
    createdBy: uid,
    createdByName: userName,
  }
  await bugRef.set(bugData)
  return { id: bugRef.key, message: `Bug "${data.title}" reportado`, bug: bugData }
}

export async function updateBug(bugId: string, updates: Record<string, any>) {
  const bug = await getById('bugs', bugId)
  if (!bug) return { error: 'Bug no encontrado' }

  const clean = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined))
  await adminDb.ref(`bugs/${bugId}`).update(clean)
  return { message: `Bug "${bug.title}" actualizado`, updated: clean }
}

// ============================================================
// MEMBERS
// ============================================================

export async function listMembers(projectId: string) {
  const project = await getById('projects', projectId)
  if (!project || !project.members) return []

  const members = []
  for (const [uid, memberData] of Object.entries(project.members)) {
    const user = await getById('users', uid)
    const role = memberData === true ? 'member' : (memberData as any)?.role || 'member'
    members.push({
      uid,
      role,
      displayName: user?.displayName || 'Usuario',
      email: user?.email || '',
      photoURL: user?.photoURL || '',
    })
  }
  return members
}

// ============================================================
// ANALYTICS
// ============================================================

export async function projectDashboard(projectId: string) {
  const tasks = await getAll('tasks')
  const projectTasks = tasks.filter(t => t.projectId === projectId)
  const bugs = await getAll('bugs')
  const projectBugs = bugs.filter(b => b.projectId === projectId)

  const total = projectTasks.length
  const byStatus: Record<string, number> = {}
  const devLoad: Record<string, { points: number; tasks: number }> = {}

  for (const task of projectTasks) {
    byStatus[task.status] = (byStatus[task.status] || 0) + 1
    if (task.developer && task.status !== 'done') {
      if (!devLoad[task.developer]) devLoad[task.developer] = { points: 0, tasks: 0 }
      devLoad[task.developer].points += task.devPoints || 0
      devLoad[task.developer].tasks += 1
    }
  }

  const completed = byStatus['done'] || 0
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    totalTasks: total,
    completionPercentage: completionPct,
    tasksByStatus: byStatus,
    developerLoad: devLoad,
    openBugs: projectBugs.filter(b => b.status !== 'closed').length,
    criticalBugs: projectBugs.filter(b => b.severity === 'critical' && b.status !== 'closed').length,
  }
}

export async function sprintBurndown(sprintId: string) {
  const sprint = await getById('sprints', sprintId)
  if (!sprint) return { error: 'Sprint no encontrado' }

  const tasks = await getAll('tasks')
  const sprintTasks = tasks.filter(t => t.sprintId === sprintId)

  const totalPoints = sprintTasks.reduce((sum: number, t: any) => sum + (t.devPoints || 0), 0)
  const completedPoints = sprintTasks
    .filter((t: any) => t.status === 'done')
    .reduce((sum: number, t: any) => sum + (t.devPoints || 0), 0)

  return {
    sprint: { id: sprint.id, name: sprint.name, startDate: sprint.startDate, endDate: sprint.endDate },
    totalTasks: sprintTasks.length,
    completedTasks: sprintTasks.filter((t: any) => t.status === 'done').length,
    totalPoints,
    completedPoints,
    remainingPoints: totalPoints - completedPoints,
    progressPercentage: totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0,
  }
}

export async function searchTasks(
  projectId: string,
  filters: {
    query?: string
    statuses?: string[]
    developers?: string[]
    minPriority?: number
    hasNoSprint?: boolean
    hasNoDeveloper?: boolean
  }
) {
  const tasks = await getAll('tasks')
  let result = tasks.filter(t => t.projectId === projectId)

  if (filters.query) {
    const q = filters.query.toLowerCase()
    result = result.filter(t =>
      t.title?.toLowerCase().includes(q) ||
      t.userStory?.what?.toLowerCase().includes(q)
    )
  }
  if (filters.statuses?.length) {
    result = result.filter(t => filters.statuses!.includes(t.status))
  }
  if (filters.developers?.length) {
    result = result.filter(t => t.developer && filters.developers!.includes(t.developer))
  }
  if (filters.minPriority) {
    result = result.filter(t => (t.priority || 0) >= filters.minPriority!)
  }
  if (filters.hasNoSprint) {
    result = result.filter(t => !t.sprintId)
  }
  if (filters.hasNoDeveloper) {
    result = result.filter(t => !t.developer)
  }

  return result.sort((a, b) => (b.priority || 0) - (a.priority || 0))
}
