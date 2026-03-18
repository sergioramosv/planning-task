# Planning Task

**Plataforma profesional de gestion de proyectos Scrum** con asistente de IA integrado, analiticas en tiempo real y soporte multi-idioma.

![Version](https://img.shields.io/badge/version-1.68.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Firebase](https://img.shields.io/badge/Firebase-12.9-orange)
![License](https://img.shields.io/badge/license-Private-red)

---

## Tabla de contenidos

- [Descripcion general](#descripcion-general)
- [Funcionalidades principales](#funcionalidades-principales)
- [Stack tecnologico](#stack-tecnologico)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Instalacion y configuracion](#instalacion-y-configuracion)
- [Scripts disponibles](#scripts-disponibles)
- [Modelo de datos](#modelo-de-datos)
- [Sistema de permisos](#sistema-de-permisos)
- [Integracion con IA](#integracion-con-ia)
- [Internacionalizacion](#internacionalizacion)
- [Versionado y releases](#versionado-y-releases)
- [Despliegue](#despliegue)
- [Testing](#testing)

---

## Descripcion general

Planning Task es una aplicacion web completa para la gestion agil de proyectos basada en la metodologia Scrum. Permite a equipos de desarrollo gestionar proyectos, sprints, tareas, bugs y propuestas con un flujo de trabajo completo, desde la planificacion hasta la entrega.

La aplicacion incluye un **asistente de IA basado en Gemini** que puede crear tareas, consultar datos del proyecto y ayudar en la planificacion directamente desde un chat integrado. Ademas, cuenta con un **dashboard analitico completo** con mas de 12 graficos interactivos y **vistas Kanban y tabla** para la gestion visual de tareas.

---

## Funcionalidades principales

### Gestion de proyectos
- Crear, editar y eliminar proyectos con descripcion, fechas, repositorios y tech stack
- Gestionar miembros del proyecto con roles (Owner, Admin, Member, Viewer)
- Invitar miembros por email con flujo de aceptacion/rechazo
- Estadisticas del proyecto: tareas totales, completadas, progreso

### Gestion de tareas
- CRUD completo con User Stories (Como.../Quiero.../Para...)
- Criterios de aceptacion y plan de implementacion
- Puntos de negocio y desarrollo (escala Fibonacci: 1, 2, 3, 5, 8, 13)
- Prioridad automatica calculada como `bizPoints / devPoints`
- Asignacion de desarrollador principal y co-desarrollador
- **Vista Kanban** con drag & drop entre columnas (To-Do, In Progress, To Validate, Done)
- **Vista Tabla** con ordenamiento por columnas y filtros avanzados
- Filtros por desarrollador, estado, sprint y busqueda por texto
- Adjuntos de archivos (Firebase Storage)
- Historial completo de cambios (audit trail)
- Comentarios con soporte de @menciones
- Borradores automaticos para tareas en progreso

### Epics (agrupacion por funcionalidad)
- Crear, editar y eliminar epics con titulo, descripcion, color y fechas
- Agrupar tareas por funcionalidad o feature
- Barra de progreso visual por epic
- Selector de epic integrado en el modal de tareas
- Badge de epic con color en las TaskCards del Kanban
- Filtro por epic en los filtros de tareas

### Gestion de sprints
- Crear, editar y eliminar sprints con fechas de inicio y fin
- Estados: Planned, Active, Completed
- Asignar tareas a sprints
- Metricas de sprint: tareas, puntos totales
- Retrospectiva de sprint con notas y feedback del equipo

### Seguimiento de bugs
- Reportar bugs con titulo, descripcion y severidad (Critical, High, Medium, Low)
- Estados: Open, In Progress, Resolved, Closed
- Asignacion a desarrolladores

### Propuestas de tareas
- Miembros pueden proponer nuevas tareas
- Owners/Admins revisan y aprueban o rechazan
- Propuestas aprobadas se convierten automaticamente en tareas

### Calendario interactivo
- Vistas: Mes, Semana, Dia, Agenda
- Drag & drop para reprogramar tareas
- Redimensionar duracion de tareas arrastrando bordes
- Colores por estado de tarea y sprints
- Filtro multi-proyecto
- Soporte para idiomas ES/EN

### Dashboard analitico (15+ graficos y widgets)
| Grafico | Descripcion |
|---------|-------------|
| **KPIs** | Tasa de completado, velocidad promedio, resolucion de bugs, sprints activos |
| **Sprint Chart** | Lineas de puntos de negocio vs desarrollo por sprint |
| **Developer Performance** | Barras de tareas completadas vs pendientes por developer |
| **Task Completion** | Progreso general de completado de tareas |
| **Task State Distribution** | Grafico de tarta con tareas por estado |
| **Overdue Tasks** | Lista de tareas vencidas |
| **Team Velocity** | Tendencia de velocidad del equipo por sprint |
| **Developer Workload** | Distribucion de carga de trabajo |
| **Sprint Burndown** | Puntos restantes vs completados durante el sprint |
| **Bugs Severity** | Distribucion de bugs por severidad |
| **Activity Heatmap** | Mapa de calor de actividad por fecha |
| **Sprint Timeline** | Linea temporal de sprints |
| **Developer Performance Metrics** | Metricas avanzadas individuales por developer |
| **Achievement Badges** | Grid de logros con filtro por categoria y barra de progreso |
| **Leaderboard** | Ranking del equipo mensual/trimestral/total con puntuacion |

### Gamificacion y logros
- 14 logros en 4 categorias: Productividad, Calidad, Colaboracion, Constancia
- Evaluacion automatica al completar tareas y cerrar bugs
- Badges visuales con filtro por categoria y barra de progreso
- Leaderboard mensual, trimestral y total del equipo
- Puntuacion basada en devPoints + bugs resueltos + logros desbloqueados
- Notificacion toast y persistente al desbloquear un logro
- Datos almacenados en Firebase RTDB (`userAchievements/{userId}`)

### Modo offline
- Service Worker para cacheo de assets estaticos (network-first strategy)
- Indicador visual "Offline" en el header con animacion de pulso
- Firebase RTDB maneja cola de operaciones pendientes automaticamente
- Notificacion toast al reconectarse con sincronizacion automatica

### Workflows automatizados
- Reglas de automatizacion configurables por proyecto
- Disparadores por cambio de estado de tarea o bug
- Acciones: notificar, cambiar estado, asignar developer
- Editor visual de reglas con diagrama de flujo (@xyflow/react)

### Templates de tareas
- Guardar tareas como templates reutilizables
- Aplicar templates al crear nuevas tareas
- Incluye User Story, criterios, puntos y plan de implementacion

### Vistas guardadas
- Guardar combinaciones de filtros como vistas personalizadas
- Restaurar filtros rapidamente desde un selector

### Time tracking
- Temporizador integrado por tarea
- Widget de timer activo visible en todo el dashboard
- Registro de tiempo dedicado por tarea

### Daily standup
- Pagina dedicada de standup por proyecto
- Formato: que hice ayer, que hare hoy, bloqueos
- Historial de standups anteriores

### Notificaciones
- Notificaciones en tiempo real via Firebase
- Tipos: asignacion de tareas, cambios de estado, comentarios, menciones, invitaciones, logros
- Centro de notificaciones con marcar como leido
- Push notifications con toast

### Equipo
- Vista de todos los miembros del equipo
- Perfiles con avatar e informacion de contacto
- Gestion de roles por proyecto

### Asistente IA (Gemini)
- Chat integrado con Google Gemini 2.5-Flash
- 21 herramientas de funcion para operar sobre el proyecto
- Puede crear tareas, sprints, bugs, consultar datos, generar analiticas
- Historial de conversaciones persistente
- Pool de API keys con control de cuotas (RPM/RPD)
- Generacion automatica de User Stories desde un titulo

### Temas y personalizacion
- Modo oscuro y modo claro
- Persistencia del tema en localStorage
- Deteccion de preferencia del sistema

### Internacionalizacion (i18n)
- Soporte completo para Ingles (EN) y Espanol (ES)
- Selector de idioma en el header
- Preferencia guardada en perfil de Firebase y localStorage
- Todas las paginas traducidas

---

## Stack tecnologico

### Frontend
| Tecnologia | Version | Uso |
|------------|---------|-----|
| Next.js | 14.2.35 | Framework React con App Router |
| React | 18.3.1 | Libreria UI |
| TypeScript | 5.9.3 | Tipado estatico |
| CSS Modules | - | Estilos encapsulados por componente |
| Recharts | 3.7.0 | Graficos del dashboard |
| react-big-calendar | 1.19.4 | Vista de calendario |
| @dnd-kit | 6.3.1 | Drag & drop (Kanban) |
| react-hook-form | 7.71.1 | Gestion de formularios |
| Zod | 4.3.6 | Validacion de schemas |
| Lucide React | 0.574.0 | Iconos |
| react-hot-toast | 2.6.0 | Notificaciones toast |
| i18next | 25.8.14 | Internacionalizacion |
| react-markdown | 10.1.0 | Renderizado Markdown |
| @xyflow/react | 12.10.0 | Diagramas de flujo |

### Backend y datos
| Tecnologia | Version | Uso |
|------------|---------|-----|
| Firebase Auth | 12.9.0 | Autenticacion (email + Google OAuth) |
| Firebase Realtime DB | 12.9.0 | Base de datos en tiempo real |
| Firebase Storage | 12.9.0 | Almacenamiento de archivos |
| Firebase Admin SDK | 13.6.1 | Operaciones server-side |
| Google Generative AI | 0.24.1 | Chatbot IA (Gemini) |

### DevOps y calidad
| Tecnologia | Version | Uso |
|------------|---------|-----|
| Jest | 30.2.0 | Testing |
| @testing-library/react | 16.3.2 | Testing de componentes |
| semantic-release | 25.0.3 | Versionado automatico |
| Husky | 9.1.7 | Git hooks |
| commitlint | 20.4.1 | Validacion de commits |
| Docker | - | Contenedorizacion |
| GitHub Actions | - | CI/CD |

---

## Arquitectura del proyecto

```
planning-task/
|-- app/                              # Next.js App Router
|   |-- (dashboard)/                  # Layout protegido (requiere auth)
|   |   |-- layout.tsx                # Header, Sidebar, AuthGuard
|   |   |-- dashboard/page.tsx        # Dashboard con KPIs, graficos, logros y leaderboard
|   |   |-- calendar/page.tsx         # Calendario interactivo
|   |   |-- my-work/page.tsx          # Vista personal de tareas asignadas
|   |   |-- projects/
|   |   |   |-- page.tsx              # Lista de proyectos
|   |   |   |-- [projectId]/
|   |   |       |-- page.tsx          # Detalle: tareas, bugs, propuestas
|   |   |       |-- sprints/page.tsx  # Gestion de sprints
|   |   |       |-- sprints/[sprintId]/retro/page.tsx  # Retrospectiva
|   |   |       |-- standup/page.tsx  # Daily standup
|   |   |       |-- workflows/page.tsx # Reglas de automatizacion
|   |   |       |-- epics/page.tsx    # Gestion de epics
|   |   |-- team/page.tsx             # Gestion del equipo
|   |   |-- profile/page.tsx          # Perfil de usuario
|   |-- api/
|   |   |-- chat/                     # Endpoints del chatbot IA
|   |   |-- tasks/generate-ai/       # Generacion IA de User Stories
|   |   |-- version/                  # Endpoint de version
|   |   |-- changelog/               # Endpoint del changelog
|   |-- login/page.tsx                # Autenticacion
|   |-- layout.tsx                    # Layout raiz
|
|-- components/
|   |-- auth/          # LoginForm, AuthGuard
|   |-- chat/          # ChatPanel, ChatFab, ChatMessage, ChatInput, ChatHistory
|   |-- dashboard/     # Header, KPIs, SprintChart, DeveloperPerformance, +12 graficos,
|   |                  # AchievementBadges, Leaderboard, AchievementToast, OfflineIndicator
|   |-- tasks/         # TaskModal, TaskForm, TaskKanban, TaskCard, TaskTable, Filters,
|   |                  # TimeTracker, SubtaskList, DependencySelector, EpicSelector
|   |-- sprints/       # SprintForm, SprintCard
|   |-- bugs/          # BugModal, BugForm, BugsList, BugCard
|   |-- proposals/     # ProposalModal, ProposalForm, ProposalsList, ProposalCard
|   |-- projects/      # MembersManager, ProjectEditModal
|   |-- ui/            # Button, Card, Modal, Input, Select, Badge, Spinner, CommandPalette
|   |-- layout/        # Navbar, Sidebar, TabsBar
|   |-- common/        # UpdateNotification, Providers
|
|-- hooks/                            # Custom React Hooks
|   |-- useAuth.ts                    # Autenticacion Firebase
|   |-- useTasks.ts                   # CRUD tareas + listeners real-time
|   |-- useProjects.ts                # CRUD proyectos
|   |-- useSprints.ts                 # CRUD sprints
|   |-- useBugs.ts                    # CRUD bugs
|   |-- useProposals.ts               # Gestion de propuestas
|   |-- useComments.ts                # Comentarios de tareas
|   |-- useNotifications.ts           # Notificaciones real-time
|   |-- useChat.ts                    # Chat con IA
|   |-- usePermissions.ts             # RBAC por proyecto
|   |-- useTaskDrafts.ts              # Borradores de tareas
|   |-- useTaskTemplates.ts           # Templates reutilizables de tareas
|   |-- useSavedViews.ts              # Vistas guardadas con filtros
|   |-- useEpics.ts                   # CRUD epics (agrupacion por feature)
|   |-- useAchievements.ts            # Logros y badges del usuario
|   |-- useWorkflowRules.ts           # Reglas de automatizacion
|   |-- useWorkflowEngine.ts          # Motor de ejecucion de workflows
|   |-- useOnlineStatus.ts            # Deteccion offline/online
|   |-- useServiceWorker.ts           # Gestion de Service Worker
|   |-- useTheme.ts                   # Tema oscuro/claro
|   |-- useLocalStorage.ts            # Persistencia local
|   |-- useFilters.ts                 # Logica de filtros
|   |-- useFileUpload.ts              # Subida de archivos
|   |-- useVersionCheck.ts            # Verificacion de version
|   |-- useChangelog.ts               # Carga del changelog
|   |-- useInvitations.ts             # Invitaciones a proyectos
|
|-- lib/
|   |-- firebase/      # config.ts (cliente), admin.ts (server)
|   |-- services/      # task, project, sprint, bug, user, comment, notification,
|   |                  # chat (Gemini), ai-tools, storage, model-pool, quota-tracker,
|   |                  # achievement, workflow
|   |-- auth/          # validateSession.ts, validateProjectAccess.ts
|   |-- utils/         # calculations, formatters, validators, cn, colors, errorHandler
|   |-- constants/     # appVersion, fibonacciPoints, taskStates
|   |-- i18n/          # config.ts (i18next setup)
|
|-- contexts/
|   |-- LanguageContext.tsx            # Proveedor de idioma
|
|-- types/                            # Interfaces TypeScript
|   |-- task.ts, project.ts, sprint.ts, user.ts, bug.ts,
|   |-- proposal.ts, notification.ts, comment.ts, draft.ts,
|   |-- filters.ts, invitation.ts, epic.ts, achievement.ts, index.ts
|
|-- locales/
|   |-- en.json                       # Traducciones ingles
|   |-- es.json                       # Traducciones espanol
|
|-- __tests__/                        # Tests con Jest
|-- public/                           # Assets estaticos
|-- .github/workflows/                # GitHub Actions (release, docker-build)
```

---

## Instalacion y configuracion

### Requisitos previos
- Node.js >= 18
- npm >= 9
- Cuenta de Firebase con proyecto configurado
- API Key de Google Generative AI (Gemini)

### 1. Clonar el repositorio
```bash
git clone https://github.com/SergioRVDev/planning-task.git
cd planning-task
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear un archivo `.env.local` en la raiz del proyecto:

```env
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="your_private_key"

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
# Opcional: multiples keys separadas por coma para pool
GEMINI_API_KEYS=key1,key2,key3

# App
NEXT_PUBLIC_APP_URL=http://localhost:3300
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```
La aplicacion estara disponible en `http://localhost:3300`

---

## Scripts disponibles

| Script | Comando | Descripcion |
|--------|---------|-------------|
| `dev` | `next dev -p 3300` | Inicia servidor de desarrollo |
| `build` | `next build` | Build de produccion |
| `start` | `next start -p 3300` | Inicia servidor de produccion |
| `lint` | `next lint` | Ejecuta ESLint |
| `test` | `jest` | Ejecuta tests |
| `test:watch` | `jest --watch` | Tests en modo watch |
| `test:coverage` | `jest --coverage` | Tests con reporte de cobertura |

---

## Modelo de datos

### Firebase Realtime Database

```
/projects/{projectId}
  |-- name, description, status
  |-- startDate, endDate
  |-- members: { uid: { role, addedAt, addedBy } }
  |-- repositories: [{ url, type, isDefault }]
  |-- languages, frameworks

/tasks/{taskId}
  |-- title, projectId, sprintId
  |-- status: to-do | in-progress | to-validate | validated | done
  |-- userStory: { who, what, why }
  |-- bizPoints, devPoints, priority
  |-- developer, coDeveloper
  |-- acceptanceCriteria: string[]
  |-- implementationPlan: { approach, steps, risks, ... }
  |-- attachments: [{ id, name, url, storagePath }]
  |-- history: { timestamp: { field, oldValue, newValue, changedBy } }

/sprints/{sprintId}
  |-- name, projectId, startDate, endDate
  |-- status: planned | active | completed

/bugs/{bugId}
  |-- title, description, projectId
  |-- severity: critical | high | medium | low
  |-- status: open | in-progress | resolved | closed
  |-- assignedTo, createdBy

/proposals/{proposalId}
  |-- title, projectId, userStory, acceptanceCriteria
  |-- bizPoints, devPoints
  |-- status: pending | accepted | rejected

/users/{uid}
  |-- email, displayName, photoURL
  |-- role: admin | developer
  |-- language: en | es

/notifications/{userId}/{notificationId}
  |-- title, message, type, read, date, link

/comments/{taskId}/{commentId}
  |-- text, userId, userName, timestamp, mentions

/invitations/{invitationId}
  |-- projectId, invitedUserId, invitedUserEmail
  |-- senderId, status: pending | accepted | rejected

/tasks-drafts/{userId}/{draftId}
  |-- projectId, formData, updatedAt

/epics/{epicId}
  |-- title, description, color, projectId
  |-- startDate, endDate, taskIds[]
  |-- createdAt, updatedAt

/userAchievements/{userId}/{achievementId}
  |-- achievementId, unlockedAt, projectId

/workflow-rules/{ruleId}
  |-- projectId, name, trigger, conditions, actions
  |-- enabled, createdAt
```

---

## Sistema de permisos

Control de acceso basado en roles (RBAC) a nivel de proyecto:

| Permiso | Owner | Admin | Member | Viewer |
|---------|:-----:|:-----:|:------:|:------:|
| Ver proyecto | Si | Si | Si | Si |
| Editar proyecto | Si | Si | No | No |
| Eliminar proyecto | Si | No | No | No |
| Gestionar miembros | Si | Si | No | No |
| Crear tareas | Si | Si | Si | No |
| Editar tareas | Si | Si | Si | No |
| Eliminar tareas | Si | Si | No | No |
| Crear sprints | Si | Si | Si | No |
| Eliminar sprints | Si | Si | No | No |
| Crear bugs | Si | Si | Si | No |
| Eliminar bugs | Si | Si | No | No |
| Aprobar propuestas | Si | Si | No | No |
| Crear propuestas | Si | Si | Si | No |

---

## Integracion con IA

### Chatbot (Gemini 2.5-Flash)
El asistente de IA esta integrado en la pagina de detalle del proyecto y puede:

- **Consultar datos**: listar proyectos, sprints, tareas, bugs, miembros
- **Crear recursos**: tareas, sprints, bugs con datos completos
- **Modificar datos**: actualizar estados de tareas, asignar developers, mover tareas a sprints
- **Analiticas**: obtener dashboard del proyecto, burndown de sprint, busquedas avanzadas

### Generacion de User Stories
El endpoint `/api/tasks/generate-ai` genera automaticamente:
- User Story completa (Como.../Quiero.../Para...)
- Criterios de aceptacion
- Puntos de negocio y desarrollo estimados

### Pool de modelos
- Soporte para multiples API keys con balanceo de carga
- Control de cuotas por minuto (RPM) y por dia (RPD)
- Rotacion automatica entre keys cuando una alcanza su limite

---

## Internacionalizacion

La aplicacion soporta dos idiomas:
- **Espanol (ES)** - Idioma por defecto
- **Ingles (EN)**

### Paginas traducidas
- Dashboard (KPIs, graficos, estadisticas)
- Lista de proyectos
- Detalle del proyecto (tareas, bugs, propuestas)
- Equipo
- Header y navegacion
- Calendario
- Modales de confirmacion
- Mensajes toast (exito/error)

### Configuracion tecnica
- `i18next` + `react-i18next` para gestion de traducciones
- `LanguageContext` como proveedor de estado del idioma
- Archivos de traduccion en `locales/es.json` y `locales/en.json`
- Persistencia en `localStorage` y perfil de Firebase

---

## Versionado y releases

### Semantic Versioning automatico
El proyecto usa `semantic-release` con Conventional Commits:

| Tipo de commit | Efecto en version | Ejemplo |
|----------------|-------------------|---------|
| `feat:` | MINOR (1.0.0 -> 1.1.0) | `feat: add kanban view` |
| `fix:` | PATCH (1.0.0 -> 1.0.1) | `fix: resolve drag drop bug` |
| `feat!:` / `BREAKING CHANGE:` | MAJOR (1.0.0 -> 2.0.0) | `feat!: redesign API` |
| `chore:`, `docs:`, `refactor:` | Sin incremento | `chore: update deps` |

### Flujo de release
1. Developer hace commit con formato convencional
2. Push a rama `main`
3. GitHub Actions ejecuta `semantic-release`
4. Se actualiza `package.json`, `CHANGELOG.md`, tags y GitHub Release
5. Version inyectada en UI via `NEXT_PUBLIC_APP_VERSION`

### Archivos clave
- `.releaserc.json` - Configuracion de semantic-release
- `.commitlintrc.json` - Reglas de validacion de commits
- `.github/workflows/release.yml` - Workflow de GitHub Actions

---

## Despliegue

### Docker
```bash
docker build -t planning-task .
docker run -p 3300:3300 planning-task
```

### Kubernetes
La aplicacion incluye soporte para despliegue en Kubernetes con:
- Multi-stage Docker builds
- Tags semanticos para imagenes
- GitHub Actions para build automatico de imagenes

### Variables de entorno requeridas
Todas las variables listadas en la seccion de [Configuracion](#3-configurar-variables-de-entorno) deben estar disponibles en el entorno de produccion.

---

## Testing

```bash
# Ejecutar todos los tests
npm test

# Modo watch
npm run test:watch

# Con cobertura
npm run test:coverage
```

### Cobertura de tests
- Componentes UI (Button, Input, Badge, Card, TaskCard, TaskForm, Chat)
- Hooks (useFilters, useTheme, useChat, useInvitations)
- Servicios (chat.service, model-pool, auth validation)
- Utilidades (formatters, calculations, validators, errorHandler)

---

## Autor

**Sergio Ramos** - [GitHub](https://github.com/SergioRVDev)

---

## Licencia

Proyecto privado. Todos los derechos reservados.
