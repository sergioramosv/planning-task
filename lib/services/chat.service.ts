import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { Project } from '@/types'
import * as AiTools from './ai-tools.service'

// ============================================================
// FUNCTION DECLARATIONS (Gemini format - 21 tools)
// ============================================================

const tools = [
  // --- PROJECTS ---
  {
    name: 'list_projects',
    description: 'Lista los proyectos del usuario actual',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_project',
    description: 'Obtiene el detalle de un proyecto',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        projectId: { type: SchemaType.STRING, description: 'ID del proyecto' },
      },
      required: ['projectId'],
    },
  },

  // --- SPRINTS ---
  {
    name: 'list_sprints',
    description: 'Lista los sprints de un proyecto',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        projectId: { type: SchemaType.STRING, description: 'ID del proyecto' },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'get_sprint',
    description: 'Obtiene el detalle de un sprint con sus tareas',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        sprintId: { type: SchemaType.STRING, description: 'ID del sprint' },
        includeTasks: { type: SchemaType.BOOLEAN, description: 'Incluir tareas del sprint' },
      },
      required: ['sprintId'],
    },
  },
  {
    name: 'create_sprint',
    description: 'Crea un nuevo sprint en un proyecto',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING, description: 'Nombre del sprint' },
        projectId: { type: SchemaType.STRING, description: 'ID del proyecto' },
        startDate: { type: SchemaType.STRING, description: 'Fecha inicio YYYY-MM-DD' },
        endDate: { type: SchemaType.STRING, description: 'Fecha fin YYYY-MM-DD' },
        status: { type: SchemaType.STRING, description: 'Estado: planned, active, completed' },
      },
      required: ['name', 'projectId', 'startDate', 'endDate'],
    },
  },
  {
    name: 'update_sprint',
    description: 'Actualiza un sprint (nombre, fechas, estado)',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        sprintId: { type: SchemaType.STRING },
        name: { type: SchemaType.STRING },
        startDate: { type: SchemaType.STRING },
        endDate: { type: SchemaType.STRING },
        status: { type: SchemaType.STRING },
      },
      required: ['sprintId'],
    },
  },

  // --- TASKS ---
  {
    name: 'list_tasks',
    description: 'Lista tareas de un proyecto con filtros opcionales',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        projectId: { type: SchemaType.STRING, description: 'ID del proyecto' },
        sprintId: { type: SchemaType.STRING, description: 'Filtrar por sprint' },
        status: {
          type: SchemaType.STRING,
          description: 'Filtrar por estado: to-do, in-progress, to-validate, validated, done',
        },
        developer: { type: SchemaType.STRING, description: 'Filtrar por developer UID' },
        searchText: { type: SchemaType.STRING, description: 'Buscar en titulo' },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'get_task',
    description: 'Obtiene el detalle completo de una tarea',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        taskId: { type: SchemaType.STRING },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'create_task',
    description: 'Crea una nueva tarea con User Story, puntos y criterios de aceptacion',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: 'Titulo de la tarea' },
        projectId: { type: SchemaType.STRING, description: 'ID del proyecto' },
        sprintId: { type: SchemaType.STRING, description: 'ID del sprint (opcional)' },
        userStoryWho: { type: SchemaType.STRING, description: 'Como [actor]...' },
        userStoryWhat: { type: SchemaType.STRING, description: 'Quiero [funcionalidad]...' },
        userStoryWhy: { type: SchemaType.STRING, description: 'Para [beneficio]...' },
        acceptanceCriteria: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: 'Criterios de aceptacion',
        },
        bizPoints: { type: SchemaType.NUMBER, description: 'Puntos de negocio (Fibonacci: 1,2,3,5,8,13)' },
        devPoints: { type: SchemaType.NUMBER, description: 'Puntos desarrollo (Fibonacci: 1,2,3,5,8,13)' },
        developer: { type: SchemaType.STRING, description: 'UID del developer asignado' },
        status: { type: SchemaType.STRING, description: 'Estado inicial (default: to-do)' },
      },
      required: [
        'title',
        'projectId',
        'userStoryWho',
        'userStoryWhat',
        'userStoryWhy',
        'acceptanceCriteria',
        'bizPoints',
        'devPoints',
      ],
    },
  },
  {
    name: 'update_task',
    description: 'Actualiza campos de una tarea existente',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        taskId: { type: SchemaType.STRING },
        title: { type: SchemaType.STRING },
        bizPoints: { type: SchemaType.NUMBER },
        devPoints: { type: SchemaType.NUMBER },
        sprintId: { type: SchemaType.STRING },
        developer: { type: SchemaType.STRING },
        startDate: { type: SchemaType.STRING },
        endDate: { type: SchemaType.STRING },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'delete_task',
    description: 'Elimina una tarea',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        taskId: { type: SchemaType.STRING },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'change_task_status',
    description: 'Cambia el estado de una tarea (to-do, in-progress, to-validate, validated, done)',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        taskId: { type: SchemaType.STRING },
        newStatus: { type: SchemaType.STRING, description: 'Nuevo estado' },
      },
      required: ['taskId', 'newStatus'],
    },
  },
  {
    name: 'assign_task',
    description: 'Asigna un developer a una tarea',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        taskId: { type: SchemaType.STRING },
        developerId: { type: SchemaType.STRING, description: 'UID del developer' },
      },
      required: ['taskId', 'developerId'],
    },
  },
  {
    name: 'move_tasks_to_sprint',
    description: 'Mueve multiples tareas a un sprint',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        taskIds: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        sprintId: { type: SchemaType.STRING },
      },
      required: ['taskIds', 'sprintId'],
    },
  },

  // --- BUGS ---
  {
    name: 'list_bugs',
    description: 'Lista bugs de un proyecto',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        projectId: { type: SchemaType.STRING },
        status: { type: SchemaType.STRING, description: 'open, in-progress, resolved, closed' },
        severity: { type: SchemaType.STRING, description: 'critical, high, medium, low' },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'create_bug',
    description: 'Crea un reporte de bug',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        description: { type: SchemaType.STRING },
        projectId: { type: SchemaType.STRING },
        severity: { type: SchemaType.STRING, description: 'critical, high, medium, low' },
        assignedTo: { type: SchemaType.STRING, description: 'UID del developer' },
      },
      required: ['title', 'description', 'projectId', 'severity'],
    },
  },
  {
    name: 'update_bug',
    description: 'Actualiza un bug (estado, severidad, asignacion)',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        bugId: { type: SchemaType.STRING },
        status: { type: SchemaType.STRING },
        severity: { type: SchemaType.STRING },
        assignedTo: { type: SchemaType.STRING },
      },
      required: ['bugId'],
    },
  },

  // --- MEMBERS ---
  {
    name: 'list_members',
    description: 'Lista los miembros de un proyecto con sus roles',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        projectId: { type: SchemaType.STRING },
      },
      required: ['projectId'],
    },
  },

  // --- ANALYTICS ---
  {
    name: 'project_dashboard',
    description:
      'Obtiene metricas del proyecto: tareas por estado, porcentaje completado, carga de developers, bugs',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        projectId: { type: SchemaType.STRING },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'sprint_burndown',
    description: 'Obtiene datos de burndown de un sprint: puntos totales vs completados',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        sprintId: { type: SchemaType.STRING },
      },
      required: ['sprintId'],
    },
  },
  {
    name: 'search_tasks',
    description: 'Busqueda avanzada de tareas con multiples filtros',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        projectId: { type: SchemaType.STRING },
        query: { type: SchemaType.STRING, description: 'Texto a buscar' },
        statuses: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        developers: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        minPriority: { type: SchemaType.NUMBER },
        hasNoSprint: { type: SchemaType.BOOLEAN },
        hasNoDeveloper: { type: SchemaType.BOOLEAN },
      },
      required: ['projectId'],
    },
  },
]

// ============================================================
// SYSTEM PROMPT BUILDER
// ============================================================

export function buildSystemPrompt(
  project: Project,
  userName: string,
  members: { uid: string; displayName: string; role: string }[]
): string {
  const memberList = members.map(m => `- ${m.displayName} (${m.role}, uid: ${m.uid})`).join('\n')

  return `Eres un asistente de gestión de proyectos integrado en la aplicación Planning Task.

CONTEXTO:
- Proyecto actual: "${project.name}" (ID: ${project.id})
- Estado: ${project.status}
- Descripción: ${project.description}
- Fechas: ${project.startDate} → ${project.endDate}
- Usuario actual: ${userName}

MIEMBROS DEL EQUIPO:
${memberList}

REGLAS:
1. Solo puedes actuar sobre el proyecto "${project.name}" (${project.id}). Usa siempre este projectId.
2. Responde SIEMPRE en español.
3. Cuando el usuario pida crear tareas, SIEMPRE incluye User Story (who/what/why), criterios de aceptación, bizPoints y devPoints.
4. Los devPoints DEBEN ser Fibonacci: 1, 2, 3, 5, 8 o 13.
5. Los bizPoints TAMBIÉN deben ser Fibonacci: 1, 2, 3, 5, 8 o 13.
6. Cuando te pidan el estado del proyecto, usa project_dashboard.
7. Formatea las respuestas con markdown (tablas, listas, negritas).
8. Sé conciso. El usuario quiere resultados, no explicaciones largas.
9. Si necesitas listar sprints o tareas para tomar una decisión, hazlo sin preguntar.
10. Cuando cambies estados, usa change_task_status (no update_task).`
}

// ============================================================
// FUNCTION CALL EXECUTOR
// ============================================================

export async function executeFunctionCall(
  name: string,
  args: Record<string, any>,
  context: { uid: string; projectId: string; userName: string }
): Promise<any> {
  const { uid, projectId, userName } = context

  switch (name) {
    // Projects
    case 'list_projects':
      return AiTools.listProjects(uid)
    case 'get_project':
      return AiTools.getProject(args.projectId || projectId)

    // Sprints
    case 'list_sprints':
      return AiTools.listSprints(args.projectId || projectId)
    case 'get_sprint':
      return AiTools.getSprint(args.sprintId, args.includeTasks)
    case 'create_sprint':
      return AiTools.createSprint(
        {
          name: args.name,
          projectId: args.projectId || projectId,
          startDate: args.startDate,
          endDate: args.endDate,
          status: args.status,
        },
        uid
      )
    case 'update_sprint':
      return AiTools.updateSprint(args.sprintId, args)

    // Tasks
    case 'list_tasks':
      return AiTools.listTasks(args.projectId || projectId, args)
    case 'get_task':
      return AiTools.getTask(args.taskId)
    case 'create_task':
      return AiTools.createTask(
        {
          title: args.title,
          projectId: args.projectId || projectId,
          sprintId: args.sprintId,
          userStory: { who: args.userStoryWho, what: args.userStoryWhat, why: args.userStoryWhy },
          acceptanceCriteria: args.acceptanceCriteria,
          bizPoints: args.bizPoints,
          devPoints: args.devPoints,
          developer: args.developer,
          status: args.status,
        },
        uid,
        userName
      )
    case 'update_task':
      return AiTools.updateTask(args.taskId, args, uid, userName)
    case 'delete_task':
      return AiTools.deleteTask(args.taskId)
    case 'change_task_status':
      return AiTools.changeTaskStatus(args.taskId, args.newStatus, uid, userName)
    case 'assign_task':
      return AiTools.assignTask(args.taskId, args.developerId, uid, userName)
    case 'move_tasks_to_sprint':
      return AiTools.moveTasksToSprint(args.taskIds, args.sprintId)

    // Bugs
    case 'list_bugs':
      return AiTools.listBugs(args.projectId || projectId, args)
    case 'create_bug':
      if (!args.projectId) args.projectId = projectId
      return AiTools.createBug(args as any, uid, userName)
    case 'update_bug':
      return AiTools.updateBug(args.bugId, args)

    // Members
    case 'list_members':
      return AiTools.listMembers(args.projectId || projectId)

    // Analytics
    case 'project_dashboard':
      return AiTools.projectDashboard(args.projectId || projectId)
    case 'sprint_burndown':
      return AiTools.sprintBurndown(args.sprintId)
    case 'search_tasks':
      return AiTools.searchTasks(args.projectId || projectId, args)

    default:
      return { error: `Función desconocida: ${name}` }
  }
}

// ============================================================
// CREATE CHAT MODEL (Gemini API)
// ============================================================

export function createChatModel(apiKey?: string, modelName?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY || ''
  const model = modelName || 'gemini-2.5-flash'

  const genAI = new GoogleGenerativeAI(key)

  const geminiModel = genAI.getGenerativeModel({
    model,
    tools: [{ functionDeclarations: tools as any }],
  })

  return geminiModel
}
