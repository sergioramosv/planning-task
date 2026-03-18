# Changelog

Todos los cambios importantes de este proyecto están documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.56.0] - 2026-03-18

### Added
- **Mi Trabajo (My Work page)**: Nueva pagina /my-work accesible desde el header que muestra tareas del developer agrupadas por proyecto, seccion "Hoy" con tareas in-progress y vencidas, bugs asignados, y stats de resumen.

## [1.55.0] - 2026-03-18

### Added
- **Vistas guardadas de filtros**: Los usuarios pueden guardar combinaciones de filtros con nombre personalizado, cargarlas desde un dropdown junto a los filtros, eliminarlas y compartirlas a nivel de proyecto. Se persisten en Firebase bajo /saved-views/.

## [1.54.3] - 2026-03-18

### Fixed
- **Dark mode del Command Palette**: Cambiado de tonos azulados (#1c1c27, #2e2e3e) a negros/grises neutros (#1a1a1a, #2a2a2a) que coinciden con el fondo real de la app en modo oscuro (#121212). Borders, hovers, badges, iconos y footer todos en escala de grises pura.

## [1.54.2] - 2026-03-18

### Fixed
- **Contraste de colores del Command Palette**: Reescrito CSS completo con colores hardcoded de alto contraste. Modo claro: fondo blanco puro (#fff), textos negros (#1f2937), meta gris oscuro (#6b7280). Modo oscuro: fondo gris oscuro (#1c1c27), textos blancos (#f3f4f6), meta gris claro (#9ca3af). Hover/active usan grises neutros en vez de violetas translucidos. Iconos en modo oscuro con fondos solidos oscuros y colores vivos.

## [1.54.1] - 2026-03-18

### Fixed
- **Ctrl+K conflicto con Chrome**: Se usa `capture: true` y `stopPropagation()` para que Ctrl+K siempre abra la paleta sin activar la barra de direcciones de Chrome.
- **Escape no funcionaba tras hacer click en el input**: El handler de teclado ahora esta directamente en el input, garantizando que Escape siempre cierra la paleta.
- **Click en tarea no abria la tarea**: Al seleccionar una tarea en la paleta, ahora navega con `?task=taskId` y la pagina del proyecto lee este parametro para abrir automaticamente el modal de la tarea.
- **Boton de busqueda del Header**: Cambiado de `KeyboardEvent` sintetico a `CustomEvent` para mayor fiabilidad.
- **Estilos visuales del Command Palette**: Mejorado con sombras mas sutiles, mejor espaciado, scrollbar personalizado, separadores entre grupos, footer con fondo, soporte responsive y mejor tema oscuro.

## [1.54.0] - 2026-03-18

### Added
- **Busqueda global con Ctrl+K**: Command Palette que permite buscar proyectos, tareas y bugs desde cualquier pagina.
  - Se abre con `Ctrl+K` (o `Cmd+K` en Mac) y con el boton de busqueda en el Header.
  - Busqueda instantanea en proyectos, tareas y bugs de todos los proyectos del usuario.
  - Resultados agrupados por tipo con iconos y colores diferenciados.
  - Navegacion con teclado: flechas arriba/abajo para navegar, Enter para abrir, Escape para cerrar.
  - Redireccion directa al proyecto/tarea/bug seleccionado.
  - Soporte completo i18n (ES/EN).
  - Diseño glass morphism consistente con el resto de la UI.
- Boton de busqueda en el Header con icono de lupa y tooltip "Buscar (Ctrl+K)".
- Nuevas claves de traduccion `commandPalette.*` en ambos idiomas.
- Documento MEJORAS_V2.md con 20 propuestas adicionales de mejora.

## [1.53.1] - 2026-03-18

### Documentation
- **README.md**: Documentacion completa del proyecto con descripcion general, funcionalidades, stack tecnologico, arquitectura, modelo de datos, permisos, integracion IA, i18n, versionado, despliegue y testing.
- **MEJORAS.md**: Documento con 20 propuestas de mejora priorizadas por impacto y esfuerzo, incluyendo subtareas, vistas guardadas, retrospectivas, dependencias, time tracking, busqueda global, epics, OKRs, gamificacion y mas.

## [1.53.0] - 2026-03-04

### Added
- **Traducción completa de la página de detalle del proyecto**: Todos los textos de la página de detalle del proyecto (`/projects/[projectId]`) ahora están en inglés y español.
  - Traducidos todos los mensajes toast: creación, actualización y eliminación de tareas, sprints, bugs y propuestas (éxito y error).
  - Traducido dropdown de selección de proyecto: "Cambiar de proyecto", "Mis proyectos", "Ver todos los proyectos".
  - Traducidas pestañas: "Tareas", "Bugs", "Propuestas".
  - Traducidos botones de vista: "Tabla", "Kanban".
  - Traducidos botones de acción: "Ver Sprints", "Agregar Tarea", "Reportar Bug", "Nueva Propuesta".
  - Traducidas cabeceras de tabla: "Título", "Estado", "Prioridad", "Developer", "Co-Dev", "Sprint", "Fecha Inicio", "Fecha Fin", "Acciones".
  - Traducidos estados vacíos: "No hay tareas aún. Crea una para comenzar.", "No se encontraron tareas con los filtros aplicados".
  - Traducidos aria-labels de botones de acción: "Ver actividad", "Editar tarea", "Eliminar tarea".
  - Traducidos modales de confirmación: "Eliminar Bug", "Eliminar Tarea" con sus respectivos mensajes de confirmación.
  - Traducido fallback de usuario: "Usuario" / "User".
- Agregada nueva sección `projectDetail` en los archivos de traducción con 51 claves nuevas para soportar toda la funcionalidad de la página de detalle del proyecto.

## [1.52.0] - 2026-03-04

### Added
- **Traducción completa de la página de equipo (Team)**: Todos los textos de la página de equipo ahora están en inglés y español.
  - Traducido título de página: "Gestión del Equipo" / "Team Management"
  - Traducido subtítulo: "Administra los miembros de tu equipo y sus proyectos" / "Manage your team members and their projects"
  - Traducido mensaje de error de login: "Por favor inicia sesión para ver el equipo" / "Please log in to view the team"
  - Traducidos contadores: "Proyectos", "miembros", "Miembros del Equipo"
  - Traducidos estados vacíos: "No tienes proyectos aún", "No hay miembros en tus proyectos"
  - Traducido badge de rol: "Miembro" / "Member"
  - Traducido fallback de usuario: "Usuario" / "User"
- Agregadas 9 claves de traducción nuevas en la sección "team" de los archivos de traducción.

## [1.51.0] - 2026-03-04

### Added
- **Traducción de página principal del dashboard**: El título de bienvenida y subtítulo ahora están en inglés y español.
  - Traducido mensaje de bienvenida: "Bienvenido, {nombre}! 👋" / "Welcome, {name}! 👋"
  - Traducido subtítulo: "Gestiona tus proyectos y tareas de forma eficiente" / "Manage your projects and tasks efficiently"
- Agregadas claves `welcomeMessage` y `subtitle` en la sección dashboard de los archivos de traducción.

## [1.50.0] - 2026-03-04

### Added
- **Traducción completa de la página de proyectos**: Todos los textos de la página de proyectos ahora están en inglés y español.
  - Traducido `projects/page.tsx`: título, subtítulo, botón de crear proyecto, todos los mensajes de toast (éxito y error), y modal de confirmación de eliminación.
  - Traducido `ProjectModal`: título del modal para crear/editar proyecto.
  - Traducido `ProjectForm`: todos los labels, placeholders, opciones de estado, tipos de repositorio, sección de tech stack, y botones de acción.
  - Traducido `ProjectList`: empty state con mensaje "No hay proyectos" / "No projects" y "Crea tu primer proyecto" / "Create your first project".
  - Traducido `ProjectCard`: tooltips de botones (editar/eliminar/copiar ID), estados del proyecto (Activo/Active, Planeado/Planned, Completado/Completed, Archivado/Archived), contadores de miembros, sprints, tareas y tareas pendientes, y mensaje de "ID copiado al portapapeles".
- Agregadas más de 40 claves de traducción nuevas en `locales/es.json` y `locales/en.json` para soportar toda la página de proyectos y sus componentes.

## [1.49.0] - 2026-03-04

### Fixed
- **i18n no funcionaba con Next.js App Router**: Añadido `react: { useSuspense: false }` en configuración de i18n y check de `isInitialized` para evitar doble inicialización. Ahora las traducciones funcionan correctamente en todos los componentes.
- **Traducciones no se actualizaban**: Añadido listener de evento `languageChanged` en `LanguageContext` para sincronizar estado cuando i18n cambia. Inicialización de i18n con idioma guardado inmediatamente.

### Changed
- **Rediseño del selector de idioma**: Cambiado de dos botones a un único botón toggle que muestra el idioma actual (🇪🇸 ES o 🇬🇧 EN). Al hacer clic, cambia automáticamente al otro idioma.
- **Soporte completo para modo oscuro/claro**: Estilos específicos para cada tema usando `[data-theme='dark']` y `[data-theme='light']`.
- **Animaciones mejoradas**: Efecto de escala al hover/click y rotación de bandera (12°) al pasar el cursor.
- **Orden de idiomas**: EN primero, ES después (estándar internacional).

## [1.48.2] - 2026-03-04

### Fixed
- **Selector de idioma requiere dos clics**: Refactorizado `LanguageContext` para importar i18n directamente, inicializar el estado desde localStorage inmediatamente, y hacer el cambio de idioma síncrono. Ahora el cambio de idioma funciona al primer clic sin necesidad de doble clic.
- Eliminado el retorno `null` durante inicialización que causaba problemas de renderizado.
- `setLanguage` ahora es función síncrona que cambia el idioma instantáneamente, mientras el guardado en Firebase ocurre de manera asíncrona sin bloquear.

## [1.48.1] - 2026-03-04

### Fixed
- **Layout shift en selector de idioma**: Los botones del `LanguageSwitcher` ahora tienen ancho mínimo fijo (`min-width: 3.5rem`) y `flex-shrink: 0` para evitar que se muevan de posición al cambiar entre idiomas. El código "EN"/"ES" también tiene ancho fijo para mantener el layout estable.

## [1.48.0] - 2026-03-04

### Added
- **Soporte de internacionalización (i18n)**: Sistema completo de traducción con soporte para inglés y español.
- **Selector de idioma**: Componente `LanguageSwitcher` en el Header con banderas para cambiar entre inglés (🇬🇧) y español (🇪🇸).
- **Persistencia de idioma**: La preferencia de idioma se guarda en localStorage y en el perfil del usuario en Firebase, manteniéndose después de F5 o al volver más tarde.
- **Archivos de traducción**: `locales/en.json` y `locales/es.json` con todas las traducciones de la aplicación organizadas por secciones (common, nav, dashboard, projects, tasks, bugs, proposals, team, notifications, profile, komodo, auth, validation, confirmations, errors, success).
- **Contexto de idioma**: `LanguageContext` que gestiona el estado del idioma y sincroniza con i18next, localStorage y Firebase.
- **Traducción del Header**: Navegación (Dashboard, Calendario, Equipo), notificaciones e invitaciones ahora en ambos idiomas.
- **Campo `language` en User**: Añadido tipo `'en' | 'es'` opcional al tipo User para almacenar la preferencia de idioma.
- **Documentación de usuario**: Nuevo archivo `GUIA_USUARIO.md` con guía completa en español (779 líneas) sobre todas las funcionalidades de la aplicación.

### Technical
- Instaladas dependencias: `i18next` (v24.2.2) y `react-i18next` (v15.2.3).
- Configuración de i18n en `lib/i18n/config.ts` con español como idioma por defecto.
- Hook `useLanguage()` que devuelve `{ language, setLanguage, t }` para traducir textos.
- Componente `Providers` que envuelve la aplicación con `LanguageProvider`.

## [1.47.2] - 2026-02-25

### Fixed
- **Corrección definitiva de edición de tareas**: Resueltos problemas con valores `undefined` en campos opcionales (developer, coDeveloper, startDate, endDate, userStory) que impedían que react-hook-form detectara cambios correctamente. Añadido `toast.error` para mostrar errores de validación visibles al usuario en lugar de fallar silenciosamente.

## [1.47.1] - 2026-02-25

### Fixed
- **Edición de tareas con bizPoints legacy**: Las tareas creadas antes del cambio a Fibonacci (con valores 1-100) ahora se mapean automáticamente al valor Fibonacci más cercano al abrir el formulario de edición. Esto resolvía que el formulario fallaba silenciosamente la validación y no guardaba ningún cambio (ni developer, ni sprint, ni nada).

## [1.47.0] - 2026-02-25

### Added
- **Login y registro con Google**: Botón "Continuar con Google" en la página de login usando Firebase Authentication con GoogleAuthProvider y signInWithPopup.
- Creación automática de usuario en Firebase DB al registrarse con Google por primera vez.
- Actualización de photoURL y displayName desde el perfil de Google en cada login.
- Mensajes de error específicos para `account-exists-with-different-credential` y `popup-blocked`.
- Separador visual "o" entre login con Google y formulario de email/contraseña.

## [1.46.0] - 2026-02-25

### Added
- **Utilidad errorHandler**: Nuevo módulo `lib/utils/errorHandler.ts` con mapeo de errores técnicos a mensajes amigables en español.
- Función `getUserFriendlyError()` que convierte errores de Firebase, red, permisos, auth, quota, etc. a mensajes comprensibles para el usuario.
- Función `getSafeApiError()` para sanitizar errores en respuestas de API sin exponer detalles internos.
- Integrado en el hook `useChat` para mostrar mensajes amigables en lugar de errores técnicos.

### Added (Tests)
- Test suite `errorHandler.test.ts` con 34 tests cubriendo todos los patrones de error.

## [1.45.0] - 2026-02-25

### Added
- **Generación automática de User Story y Puntos con IA**: Botón "Generar con IA" en TaskForm que genera automáticamente User Story (quién/qué/para qué), bizPoints, devPoints y criterios de aceptación a partir del título de la tarea.
- API Route `/api/tasks/generate-ai` (POST) con validación de sesión, acceso al proyecto y sistema de rotación de modelos.
- Validación Fibonacci en la respuesta de la IA con fallback a valor 3 para puntos inválidos.
- Soporte para contexto adicional opcional en la generación.
- Limpieza automática de bloques markdown en respuestas de la IA.

### Fixed
- Corregido error de temporal dead zone en TaskForm: `useFieldArray` movido antes del `useCallback` que lo referencia.

### Added (Tests)
- Test suite `generateAi.test.ts` con 17 tests cubriendo autenticación, validación, generación exitosa, Fibonacci y errores.

## [1.44.0] - 2026-02-25

### Added
- **Notificaciones push en la interfaz**: Componente `NotificationPush` que muestra toasts en tiempo real para nuevas notificaciones e invitaciones.
- Integración con `react-hot-toast` para notificaciones visuales con iconos y estilos personalizados.
- Detección automática de nuevas notificaciones sin necesidad de recargar la página.

### Added (Tests)
- Test suite `NotificationPush.test.tsx` con tests de renderizado, detección de nuevas notificaciones y integración con toasts.

## [1.43.0] - 2026-02-25

### Added
- **Invitaciones a proyectos con asignación de rol**: El sistema de invitaciones ahora permite seleccionar el rol del invitado (member, viewer, admin).
- Mejoras en MembersManager con selector de rol al enviar invitaciones.
- Gestión de roles diferenciados para los miembros del proyecto.

### Added (Tests)
- Test suite `useInvitationsRole.test.ts` con tests de asignación de roles y gestión de invitaciones.

## [1.42.0] - 2026-02-25

### Added
- **Toasts de confirmación para todas las acciones**: Todas las acciones de usuario (crear, actualizar, eliminar tareas/sprints/bugs/propuestas) muestran toasts de confirmación con `react-hot-toast`.
- Toasts de éxito (verde) y error (rojo) según el resultado de la operación.
- Posición consistente en esquina superior derecha.

### Added (Tests)
- Test suite `ProjectToasts.test.ts` con tests de integración de toasts en acciones de proyecto.

## [1.41.0] - 2026-02-25

### Added
- **Selector de proyectos en la página del proyecto**: El nombre del proyecto junto a la flecha de volver ahora es clickable y abre un dropdown para cambiar de proyecto sin volver al listado.
- Dropdown con lista de proyectos activos/planificados, indicador del proyecto actual y enlace "Ver todos los proyectos".
- Animación de entrada y click-outside para cerrar el dropdown.

### Changed
- **Eliminado selector de proyectos del Header**: El project switcher se ha movido del Header global a la página de detalle del proyecto para una navegación más limpia.
- Header simplificado: eliminados imports de useProjects, usePathname, useRef, useEffect y iconos de proyecto.

## [1.40.0] - 2026-02-25

### Added
- **Persistencia de vista Tabla/Kanban**: La selección del tipo de vista de tareas (Tabla o Kanban) se guarda en localStorage y se mantiene al recargar la página.
- Hook `useLocalStorage` para gestión genérica de estado persistente.

### Added (Tests)
- Test suite `useLocalStorageViewMode.test.ts` con tests de persistencia, lectura y cambio de modo de vista.

## [1.39.0] - 2026-02-25

### Added
- **Copiar mensajes del chat IA**: Botón de copiar en cada mensaje del asistente de IA que copia el contenido completo al portapapeles.
- Feedback visual con cambio de icono (check) al copiar exitosamente.

### Added (Tests)
- Test suite `ChatMessageCopy.test.tsx` con tests de funcionalidad de copia y feedback visual.

## [1.38.0] - 2026-02-25

### Added
- **Historial de conversaciones del chat IA**: Componente `ChatHistory` que muestra conversaciones anteriores con búsqueda, fecha y contador de mensajes.
- API Routes para CRUD de conversaciones: `POST /api/chat/conversations`, `GET /api/chat/conversations`, `PUT /api/chat/conversations/[id]`, `DELETE /api/chat/conversations/[id]`.
- Guardado automático de conversaciones después de cada respuesta exitosa del asistente.
- Carga de conversaciones anteriores con restauración completa de mensajes.
- Eliminación de conversaciones individuales.

### Added (Tests)
- Test suite `ChatHistory.test.tsx` con tests de renderizado, búsqueda y navegación.
- Test suite `useChatHistory.test.ts` con tests de carga, guardado, eliminación y búsqueda de conversaciones.
- Test suite `TaskKanban.test.tsx` con tests de renderizado de columnas y drag-and-drop.

## [1.37.1] - 2026-02-25

### Fixed
- **Botón de borrar tarea visible para todos los usuarios**: Investigado y corregido el problema de visibilidad del botón de eliminar que se ocultaba a ciertos usuarios por permisos incorrectos.

## [1.37.0] - 2026-02-25

### Added
- **Modal de confirmación para eliminar tareas**: Reemplazado el alert() nativo por un ConfirmationModal profesional tanto en el modal de edición como en la vista de tabla.
- **Botón de eliminar en header del modal**: El botón de borrar ahora aparece como un icono de papelera en el header del modal de edición, junto al botón de cerrar, en lugar de ocupar espacio en el body.
- Prop `headerActions` en componente Modal para permitir botones adicionales en el header junto al botón de cerrar.

### Changed
- Mejorada la UX de eliminación de tareas con confirmación modal consistente en todas las vistas.
- El botón de eliminar en el header tiene hover effect con fondo rojo suave para mejor feedback visual.
- **Botones de acciones en tabla ahora son solo iconos**: Los botones de Actividad, Editar y Borrar en la tabla de tareas ahora muestran solo iconos (MessageSquare, Edit2, Trash2) para reducir el ancho de la columna de acciones y hacer la tabla más compacta.

## [1.36.0] - 2026-02-24

### Added
- **Botón de eliminar en tarjetas de Kanban**: Las tarjetas de tareas en la vista Kanban ahora muestran un botón de eliminar (icono de papelera) que aparece al hacer hover sobre la tarjeta.
- El botón de borrar previene la propagación del evento click para no abrir el modal de edición al eliminar.
- Diseño mejorado del TaskCard con header separado para mejor organización visual.

## [1.35.1] - 2026-02-24

### Changed
- **Columnas Kanban ahora unificadas**: La vista Kanban ahora muestra una sola columna "done & validated" que agrupa ambos estados, reduciendo la complejidad visual del board.

## [1.35.0] - 2026-02-24

### Changed
- **Puntos de negocio ahora usan Fibonacci**: Los bizPoints cambiaron del rango 1-100 a la secuencia Fibonacci (1, 2, 3, 5, 8, 13, 21, 34) para mantener consistencia con los puntos de desarrollo y evitar valores arbitrarios como 10000.
- TaskForm y ProposalForm ahora usan Select con opciones Fibonacci para bizPoints en lugar de Input numérico libre.
- Validadores actualizados para restringir bizPoints a valores Fibonacci válidos.
- Descripción en ChatService actualizada para reflejar el nuevo rango Fibonacci.
- **Columnas Validated y Done unificadas en Kanban**: La vista Kanban ahora muestra una sola columna "done & validated" que agrupa ambos estados, reduciendo la complejidad visual del board.

## [1.34.0] - 2026-02-24

### Added
- **AI Chat Assistant con Gemini 1.5 Flash**: ChatPanel integrado en la vista de proyecto con acceso a todas las funciones de gestión de tareas, sprints, bugs y métricas.
- Firebase Admin SDK para operaciones server-side seguras (Node.js).
- Middleware de autenticación y validación de acceso a proyectos (`validateSession`, `validateProjectAccess`).
- Servicios server-side: `ai-tools.service.ts` con 21 funciones (createTask, updateTask, listTasks, projectDashboard, sprintBurndown, etc.).
- `NotificationAdminService` para notificaciones desde el servidor.
- `GeminiService` con Function Calling: 21 herramientas registradas, system prompt builder, ejecutor de funciones y streaming.
- API Route `/api/chat` (POST) con validación de sesión, contexto de proyecto y respuesta streaming con ReadableStream.
- Hook `useChat` para gestión de estado del chat (mensajes, loading, error, envío de mensajes).
- Componentes de UI: `ChatPanel`, `ChatMessage` (con ReactMarkdown + remarkGfm), `ChatInput` (textarea auto-resize), `ChatFab` (floating action button).
- CSS Modules completos con animaciones (slide-in panel, bouncing dots typing indicator, backdrop).
- Variables de entorno: `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`, `GEMINI_API_KEY`.

### Changed
- Instaladas dependencias: `firebase-admin` (^13.3.0), `@google/generative-ai` (^0.24.1), `react-markdown` (^9.0.2), `remark-gfm` (^4.0.0).
- La página de detalle de proyecto (`app/(dashboard)/projects/[projectId]/page.tsx`) ahora incluye ChatFab y ChatPanel con backdrop.

## [1.33.0] - 2026-02-24

### Added
- Sistema de borradores de tareas: al cerrar el modal de creación sin enviar, los datos del formulario se guardan automáticamente en localStorage.
- DraftPickerModal: al hacer clic en "Agregar Tarea" con borradores pendientes, muestra un diálogo para elegir continuar con un borrador o crear una tarea nueva.
- Hook `useTaskDrafts` para gestión CRUD de borradores por proyecto (máximo 10 por proyecto).
- Tipo `TaskDraft` para representar borradores con id, título, datos del formulario y timestamps.
- TaskForm ahora usa `forwardRef` + `useImperativeHandle` para exponer `getFormValues()` al componente padre.
- Soporte para `initialFormData` en TaskForm para pre-cargar datos de un borrador.
- Los borradores se eliminan automáticamente al crear la tarea exitosamente.

## [1.32.0] - 2026-02-24

### Added
- Campos de repositorios GitHub en proyectos: URL + tipo (Frontend/Backend/API/Full Stack) + badge "Por defecto", con soporte para múltiples repos dinámicos.
- Campos de lenguajes y frameworks (texto libre) en la creación y edición de proyectos.
- Tab "Repositorios" en el modal de edición de proyectos para gestionar repos, lenguajes y frameworks.
- Plan de implementación opcional en tareas: enfoque técnico, pasos, cambios en modelo de datos, cambios en API, riesgos y fuera de alcance.
- Sistema de archivos adjuntos en tareas con subida a Firebase Storage y seguimiento de progreso.
- Servicio de Storage (`StorageService`) con upload individual/múltiple, progreso y eliminación.
- Hook `useFileUpload` para gestión de estado de subida de archivos en React.
- Inicialización de Firebase Storage en la configuración de Firebase.

### Changed
- TaskForm rediseñado con 4 tabs tipo Chrome: General, User Story, Implementación y Adjuntos (sin scroll).
- Cada tab tiene altura fija con scroll independiente para mantener el layout compacto.
- Validación de formulario redirige automáticamente al tab con errores.
- Badge numérico en tab Adjuntos muestra cantidad de archivos.
- Tests de TaskForm actualizados para la nueva interfaz con tabs.

## [1.31.3] - 2026-02-24

### Added
- Tests para TaskCard: renderizado de título, developer, sprint, prioridad/puntos, fecha, elementos condicionales, click handler y clase dragging.
- Tests para TaskForm: secciones, inputs, selects, criterios de aceptación, botón crear/actualizar.
- Tests para useTheme: tema por defecto, lectura de localStorage, toggle, atributo data-theme, persistencia.

## [1.31.2] - 2026-02-24

### Changed
- Rediseño de cards kanban: mucho más compactas, título completo visible (sin truncado).
- Eliminados badge de estado (redundante con columna) e ID de Firebase.
- Layout ligero: título + tags developer/sprint + prioridad/puntos/fecha en una línea.

## [1.31.1] - 2026-02-24

### Changed
- Optimizado modal de crear/editar tareas: eliminadas Cards pesadas, reemplazadas por secciones ligeras con separadores.
- Layout compacto con grids de 3 y 4 columnas (Sprint/Developer/CoDeveloper en fila, fechas y puntos en fila).
- User Story en 3 columnas. Modal ampliado a 64rem. Gaps reducidos.
- Añadido responsive para pantallas pequeñas.

## [1.31.0] - 2026-02-24

### Added
- Modo oscuro/claro con toggle de Sol/Luna en el Header (a la izquierda de invitaciones).
- Hook `useTheme` con persistencia en localStorage y respeto a preferencia del sistema.
- Script de inicialización en layout.tsx para evitar flash de tema incorrecto.
- Variables CSS semánticas para temas (`--bg-primary`, `--bg-elevated`, `--text-primary`, etc.) con overrides en `[data-theme="dark"]`.
- Soporte dark mode en todos los CSS modules: colores hardcodeados reemplazados por variables.

## [1.30.5] - 2026-02-24

### Fixed
- Reemplazados colores hex hardcodeados por CSS variables en 7 archivos CSS modules: SprintTimeline, DeveloperPerformanceMetrics, OverdueTasks, BugsList, ProposalsList, InvitationsModal y sprints/page.
- Añadidas nuevas CSS variables al sistema de diseño: `--color-blue-500`, `--color-red-50`, `--color-red-800`, `--color-green-500` con soporte dark mode.

## [1.30.4] - 2026-02-24

### Fixed
- Reemplazados todos los `background-color: white` y `background: white` hardcodeados por `var(--bg-elevated)` en 12 archivos CSS modules para soporte de dark mode.

## [1.30.3] - 2026-02-24

### Fixed
- Corregidos todos los tests de componentes UI (Badge, Button, Input, Card) que fallaban por usar clases Tailwind en vez de CSS Modules.
- Actualizados tests de validators y types para reflejar campos opcionales (`developer`, `startDate`, `coDeveloper`).
- Actualizado test de calculations para manejar tareas sin developer asignado.

### Added
- Nuevo test suite para componente Select (9 tests).
- Test para validar tarea sin developer y sin fechas (campos opcionales).
- Test para `getDeveloperMetrics` con tareas sin developer.

## [1.30.2] - 2026-02-24

### Fixed
- Corregido error de Firebase `undefined` en `coDeveloper` y `sprintId` que impedía crear y actualizar tareas.
- Campos **Developer** y **Fecha de Inicio** ahora son opcionales en la creación de tareas.
- Actualizadas vistas de tabla, kanban, tarjeta, calendario y cálculos para manejar developer/fecha vacíos.

## [1.30.1] - 2026-02-23

### Fixed
- Añadida opción de estado "Validated" que faltaba en el selector del formulario de tareas, lo que impedía actualizar tareas correctamente.
- Añadido logging de errores de validación en el formulario de tareas para facilitar depuración.

## [1.30.0] - 2026-02-22

### Added
- Campo **Co-Developer** opcional en la creación y edición de tareas, permitiendo asignar un segundo developer de apoyo.
- Columna "Co-Dev" en la vista de tabla de tareas del proyecto.
- Visualización del co-developer en las tarjetas del Kanban (TaskCard).
- Selector de co-developer en el formulario de tareas con la misma lista de miembros del proyecto.

## [1.29.4] - 2026-02-18

### Fixed
- TypeScript build error in `projects/[projectId]/page.tsx`: replaced invalid `Button` variant `"tertiary"` with `"ghost"`.

## [1.29.3] - 2026-02-18

### Fixed
- TypeScript build error in `calendar/page.tsx`: replaced string accessors (`"start"`, `"end"`) with function accessors in `DnDCalendar` to satisfy the stricter overload types of `withDragAndDrop`.

## [1.29.2] - 2026-02-18

### Fixed
- TypeScript overload error in `calendar/page.tsx` by casting `eventPropGetter` to accept any event type, ensuring compatibility with `react-big-calendar`.

## [1.29.1] - 2026-02-18

### Fixed
- TypeScript compilation error in `CalendarPage` by using the correct `View` type for state.

## [1.29.0] - 2026-02-18

### Added
- Interactive Calendar with drag-and-drop for task scheduling using `react-big-calendar`.
- Team Management page displaying all project members.
- Separate "Activity" view in Task Modal for better UX.
- View, Date, and Navigation state controls for Calendar page.

### Fixed
- Task Modal tabs removed in favor of direct view switching based on context.
- `useComments` hook now properly handles undefined user photos.
- Calendar navigation buttons functioning correctly with controlled state.

## [1.28.1] - 2026-02-18

### Fixed
- Fixed React hooks rendering order in calendar page
- Moved early returns after all state/effect hooks
- Prevents "Rendered more hooks than during previous render" error

## [1.28.0] - 2026-02-18

### Added
- Role-based access control (RBAC) system with 4 permission levels
- ProjectRole types: owner, admin, member, viewer
- usePermissions hook for checking user permissions
- ROLE_PERMISSIONS matrix defining actions per role
- Owner: full access to all project actions
- Admin: manage members and content but cannot delete project
- Member: create and edit resources but cannot delete
- Viewer: read-only access to dashboard

### Changed
- Project member format now supports both boolean and ProjectMember objects
- Action buttons now hidden based on user role and permissions
- Enhanced type safety for member management

## [1.27.1] - 2026-02-18

### Fixed
- TaskActivityPanel now integrated into TaskModal with tabs for Details and Activity
- Calendar page now properly fetches data from multiple projects
- Fixed ReactMarkdown className wrapper in CommentItem
- TaskActivityPanel accessible when editing existing tasks with proper context

### Changed
- TaskModal now requires currentUser and projectMembers props for comment/activity features

## [1.27.0] - 2026-02-18

### Added
- Team Management page at `/team` route with member overview
- Calendar page at `/calendar` route with sprint and task visualization
- Navigation buttons in Header for Team and Calendar sections
- Project filtering in calendar view
- Sprint and task listing with metadata display
- Team dashboard showing project members and active projects

## [1.26.0] - 2026-02-18

### Added
- Comment system with markdown support (react-markdown + remark-gfm)
- CommentForm component with @ mention autocomplete for developers
- CommentItem component with edit/delete functionality (only for authors)
- HistoryItem component displaying task change history in timeline format
- TaskActivityPanel unified timeline showing comments and history changes
- Activity filters: All Activity, Comments Only, Changes Only
- Comment mentions parsing and highlighting
- Real-time comment subscriptions via Firebase
- Rich text editing with markdown preview

## [1.25.0] - 2026-02-18

### Added
- Expanded notification system with 8 new notification types
- Task status change notifications (when task status is updated)
- Task update notifications (points, sprint, developer changes)
- Sprint status change notifications (planned → active → completed)
- Sprint deadline approaching notifications (proactive alert)
- Task deleted notifications
- Task reassignment notifications
- Task comment and mention notifications (foundation for comments feature)
- Toast notifications for real-time feedback (using react-hot-toast)
- Notification filtering by type (Tasks, Sprints, Projects)
- Notification grouping by date (Today, Yesterday, Older)
- Clickable notifications with navigation links

## [1.24.3] - 2026-02-18

### Fixed
- Increased Activity Heatmap cell size from 14px to 22px for better visibility
- Centered heatmap layout with improved spacing and alignment
- Added scale animation on cell hover for better interactivity

## [1.24.2] - 2026-02-18

### Changed
- Aligned Overdue Tasks, Bugs Severity, and Activity Heatmap in 3-column responsive grid
- Responsive breakpoints: 3 columns (1280px+), 2 columns (1024-1279px), 1 column (mobile)

## [1.24.1] - 2026-02-18

### Changed
- Optimized dashboard layout with grouped grid charts (Bugs + Heatmap side by side)
- Sprint Timeline now shows max 8 sprints with scrollable overflow

## [1.24.0] - 2026-02-18

### Added
- Dashboard KPIs card with completion rate, team velocity, bug resolution rate, and active sprints (v1.15)
- Task State Distribution pie chart (To-Do, In-Progress, To-Validate, Done) (v1.16)
- Overdue Tasks table with visual alerts for past-deadline tasks (v1.17)
- Team Velocity line chart tracking points delivered across sprints (v1.18)
- Developer Workload bar chart showing task distribution and balance (v1.19)
- Sprint Timeline with visual status badges and remaining days (v1.20)
- Sprint Burndown bar chart for pending vs completed tasks per sprint (v1.21)
- Bugs by Severity bar chart with open/closed breakdown (v1.22)
- Activity Heatmap (GitHub-style) showing 12-week work patterns (v1.23)
- Developer Performance Metrics detailed dashboard with productivity badges (v1.24)
- All analytics components respect selected projects and team members only

## [1.14.3] - 2026-02-18

### Fixed
- X-axis labels now display horizontally (0 degrees) for cleaner appearance

## [1.14.2] - 2026-02-18

### Fixed
- X-axis labels now display vertically (90 degrees) instead of angled

## [1.14.1] - 2026-02-18

### Fixed
- Tasks completion chart now displays bars side by side instead of stacked
- Improved X-axis label positioning for better readability

## [1.14.0] - 2026-02-18

### Added
- Tasks Completion Chart showing total vs completed tasks by sprint and project

## [1.13.1] - 2026-02-18

### Fixed
- Developer filter now shows only developers from selected projects

## [1.13.0] - 2026-02-18

### Changed
- Moved developer filter select to chart header next to title for better layout organization

## [1.12.0] - 2026-02-18

### Changed
- Reorganized Sprint Chart layout with chart on left and metrics panel on right
- Added metrics sections for Business Points, Development Points, and Bugs with totals and averages

## [1.11.0] - 2026-02-18

### Added
- Total Bugs Done count in Sprint Chart summary section for complete metrics visibility

## [1.10.0] - 2026-02-18

### Added
- BugService for fetching bug data from Firebase
- Dashboard now filters projects to show only those where user is a member
- Bugs Done metric added to Sprint Chart (orange line)
- Bugs are associated to sprints by creation date (within sprint date range)

## [1.9.1] - 2026-02-18

### Added
- Dashboard button in header navigation for quick access

## [1.9.0] - 2026-02-18

### Added
- ConfirmationModal for bug deletion instead of native alert
- Alignment of bug filters and "Reportar Bug" button in same row

### Changed
- Move action button into BugsList component to optimize layout

## [1.8.3] - 2026-02-18

### Fixed
- Correct TypeScript typing for ProposalForm useForm and useFieldArray

## [1.8.2] - 2026-02-18

### Fixed
- Use FieldArray for acceptance criteria in ProposalForm (array of inputs instead of textarea)
- Add missing label for Puntos de Desarrollo select in ProposalForm
- Update ProposalModal to handle acceptanceCriteria as array instead of string

## [1.8.1] - 2026-02-18

### Changed
- Update ProposalForm styling to match TaskForm layout with Card components
- Reorganize proposal form sections (Information > Dates & Points > User Story > Criteria)
- Improve form consistency across task and proposal creation flows

## [1.8.0] - 2026-02-18

### Added
- Proposals system for suggesting new tasks before they are created
- ProposalForm component with same fields as tasks (user story, points, criteria)
- Users can create proposals with title, user story (who/what/why), acceptance criteria, dates, and points
- ProposalCard shows proposal details with calculated priority score
- ProposalsList for managing proposals with status tracking
- Proposals tab in project details page with counter badge
- Accept proposal flow: select sprint and automatically create task with proposal data
- Reject proposal option to mark proposals as rejected
- Proposal status: pending, accepted, rejected
- Real-time proposal list updates using Firebase listeners

## [1.7.1] - 2026-02-18

### Fixed
- Remove duplicate useBugs hook declaration in project details page

## [1.7.0] - 2026-02-18

### Added
- Bugs system as a separate workflow from regular tasks
- Bug creation with simplified form: title, description, severity, and attachments
- Bugs tab in project details page with counter badge (blue badge color)
- BugForm component with file upload support (multiple attachments per bug)
- BugCard component displaying bug details with severity indicators
- BugsList component with filters by status and severity
- TabsBar component for navigation between Tasks and Bugs views
- Bug severities: critical, high, medium, low
- Bug statuses: open, in-progress, resolved, closed
- No sprints, story points, or developers assignment for bugs (simpler workflow)
- Real-time bug list updates using Firebase listeners
- Badge counters in blue color (not red) for both tasks and bugs

## [1.6.0] - 2026-02-18

### Added
- Notification service for sending notifications to users
- Task assignment notifications: users are notified when a task is assigned to them
- Member removal notifications: users are notified when they are removed from a project
- Project invitation notifications: users are notified when invited to a project
- All notifications include relevant context (project name, creator name, task details)

## [1.5.16] - 2026-02-18

### Fixed
- Fix Firebase update syntax for adding member to project on invitation accept

## [1.5.15] - 2026-02-18

### Added
- Invitation system for adding project members
- Users receive invitations in header with Mail icon notification badge
- Invitations show project name and creator information
- Users can accept or reject invitations
- Accepting invitation automatically adds user to project members
- InvitationsModal component to manage pending invitations
- Invitation persistence in Firebase database

## [1.5.14] - 2026-02-18

### Fixed
- Update members list in real-time when adding or removing members from project
- No longer required to close and reopen modal to see new members

## [1.5.13] - 2026-02-18

### Added
- Automatic version checking system with 60-second polling interval
- Update notification modal that displays current vs new version
- Auto-refresh mechanism: forces update after 10 seconds if user doesn't click update
- Version endpoint at /api/version for fetching current app version
- Update notification cannot be dismissed - ensures users always update

## [1.5.12] - 2026-02-18

### Fixed
- Ensure sprints always include projectId when created
- Show all project members in developer dropdown (not just current user)
- Fetch and display project members as available developers for task assignment

## [1.5.11] - 2026-02-18

### Fixed
- Improve sprint creation form with proper error handling and validation
- Add validation to ensure sprint end date is after start date
- Display validation errors clearly in sprint creation modal
- Add loading state feedback during sprint creation

## [1.5.10] - 2026-02-18

### Changed
- Add task ID column to task table for better task identification
- Improve sprint card grid layout (increased from 280px to 380px minimum width)
- Remove border from summary cards for cleaner appearance
- Abbreviate "Pts Negocio" to "Pts Neg" in sprint cards for space efficiency

## [1.5.9] - 2026-02-18

### Added
- View Sprints button in project tasks page for easy navigation to sprint management

## [1.5.8] - 2026-02-18

### Added
- Detailed task information in Kanban cards (task ID, developer name, sprint, dates, business and dev points)
- Enhanced task card styling with organized sections for better readability
- Developer name and sprint name resolution in Kanban view

## [1.5.7] - 2026-02-18

### Added
- Task filters for Kanban view (developer, status, sprint, search by name)
- Filter persistence synchronized between table and kanban views
- Clear filters button for quick reset

## [1.5.6] - 2026-02-18

### Fixed
- Redirect authenticated users from /login to /projects instead of /dashboard
- Show loading spinner while validating session on login page
- Prevent redirect flashing on login when user is already authenticated

## [1.5.5] - 2026-02-18

### Fixed
- Resolve build errors and type issues in project components
- Add missing onCancel prop to SprintForm component
- Replace Input component with native textarea for project description field
- Fix HTMLTextAreaElement type compatibility in ProjectEditModal
- Remove reference to non-existent task.epic property from TaskTable
- Handle optional endDate field in task table display
- Fix type errors in ProjectEditModal change event handler

## [1.5.4] - 2026-02-18

### Added
- Sprint chart component with line graph for business and development points by sprint
- Developer performance charts (bar chart and pie chart) synchronized with project filters
- Project selector as mini white cards with checkboxes in dashboard
- Developer filter with proper name display in sprint chart
- DeveloperPerformance component that filters data by selected projects
- useLocalStorage hook for state persistence
- Services for project, sprint, task, and user data access

### Fixed
- Show only completed tasks (status === 'done') in sprint points calculation
- Restore developer filter dropdown with proper name display
- Use correct user.uid instead of user.id when finding developers
- Dashboard state management with synchronized project filters

### Changed
- Reorganized sprint chart filters with developer filter above chart
- Updated chart data to only count tasks with 'done' status
- Improved global statistics display (projects, tasks, completed tasks)

## [1.1.0] - 2026-02-17

### Added
- add project editing and members management
- add automatic versioning system with changelog modal

### Fixed
- improve changelog parser to infer change types from section headers

## [1.0.0] - 2025-02-17

### Added
- Sistema de versionado automático con Semantic Release
- Visualización de versión en el header de la aplicación
- Modal de changelog para ver historial de cambios
- Validación automática de commits con Conventional Commits
- Generación automática de releases en GitHub
- Hook para lectura de changelog desde API
- Estilos consistentes para versión en el header

### Notes

**El archivo CHANGELOG.md será actualizado automáticamente** por `semantic-release` en cada nuevo release basado en los commits siguiendo el estándar Conventional Commits.

Tipos de commits soportados:
- `feat:` - Nueva característica (incrementa MINOR)
- `fix:` - Corrección de bug (incrementa PATCH)
- `feat!:` o `BREAKING CHANGE:` - Cambio breaking (incrementa MAJOR)
- `docs:`, `chore:`, `refactor:`, `test:` - Sin incremento de versión
