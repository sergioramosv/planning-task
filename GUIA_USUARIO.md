# Planning Task - Guía de Usuario

## 📋 Índice

1. [¿Qué es Planning Task?](#qué-es-planning-task)
2. [Características Principales](#características-principales)
3. [Roles y Permisos](#roles-y-permisos)
4. [Proyectos](#proyectos)
5. [Sprints](#sprints)
6. [Tareas](#tareas)
7. [Bugs](#bugs)
8. [Propuestas](#propuestas)
9. [Dashboard](#dashboard)
10. [Komodo - Automatización](#komodo---automatización)
11. [Equipo e Invitaciones](#equipo-e-invitaciones)
12. [Notificaciones](#notificaciones)
13. [Perfil de Usuario](#perfil-de-usuario)

---

## ¿Qué es Planning Task?

**Planning Task** es una plataforma de gestión de proyectos diseñada específicamente para equipos de desarrollo de software. Combina metodologías ágiles con herramientas modernas de planificación, seguimiento y automatización.

### Para quién es

- **Product Owners**: Definen y priorizan el trabajo basándose en valor de negocio
- **Scrum Masters**: Planifican sprints y gestionan el flujo de trabajo
- **Desarrolladores**: Trabajan en tareas asignadas con contexto completo
- **QA/Testers**: Validan tareas y reportan bugs
- **Stakeholders**: Visualizan progreso y métricas del proyecto

### Problemas que resuelve

✅ **Priorización inteligente**: Sistema de puntos de negocio vs. desarrollo que calcula automáticamente la prioridad (ROI)
✅ **Trazabilidad completa**: Cada tarea incluye User Story, criterios de aceptación e historial de cambios
✅ **Colaboración efectiva**: Comentarios, menciones y notificaciones en tiempo real
✅ **Visibilidad del progreso**: Dashboards con gráficos de burndown, performance y carga de trabajo
✅ **Automatización**: Komodo automatiza la creación de código mediante agentes inteligentes

---

## Características Principales

### 🎯 Gestión por Valor
- **Puntos de negocio**: Valor que aporta al negocio (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Puntos de desarrollo**: Esfuerzo técnico requerido (Fibonacci: 1, 2, 3, 5, 8, 13)
- **Prioridad automática**: Calculada como `bizPoints / devPoints` (mayor valor con menor esfuerzo = mayor prioridad)

### 📊 Metodología Ágil
- Organización en **Sprints** con fechas de inicio y fin
- Estados de tarea: `to-do` → `in-progress` → `to-validate` → `validated` → `done`
- Gráficos de **burndown** y progreso de sprint
- **User Stories** con formato: "Como [quien], quiero [qué], para [beneficio]"

### 🤖 Automatización con Komodo
- **PLANNER**: Selecciona la siguiente tarea de mayor prioridad
- **CODER**: Genera código, crea branch y Pull Request
- **REVIEWER**: Hace code review automático con 8 criterios de calidad
- Ciclo completo desde planificación hasta merge

### 📈 Métricas y Reportes
- Dashboard con estadísticas de proyectos
- Gráficos de progreso por sprint
- Performance individual de desarrolladores
- Distribución de carga de trabajo
- Seguimiento de bugs por severidad

---

## Roles y Permisos

Planning Task cuenta con **4 roles** con diferentes niveles de acceso:

### 👑 Owner (Propietario)
**Permisos completos** sobre el proyecto:
- ✅ Editar y eliminar el proyecto
- ✅ Gestionar miembros (añadir, eliminar, cambiar roles)
- ✅ Crear, editar y eliminar sprints
- ✅ Crear, editar y eliminar tareas
- ✅ Crear, editar y eliminar bugs
- ✅ Crear propuestas y aprobar/rechazar propuestas
- ✅ Acceso a dashboard y equipo

**Ideal para**: Creador del proyecto, líder técnico o product owner

---

### 🛡️ Admin (Administrador)
**Casi todos los permisos**, excepto eliminar el proyecto:
- ✅ Editar el proyecto (nombre, descripción, fechas)
- ❌ Eliminar el proyecto
- ✅ Gestionar miembros
- ✅ Crear, editar y eliminar sprints
- ✅ Crear, editar y eliminar tareas
- ✅ Crear, editar y eliminar bugs
- ✅ Crear propuestas y aprobar/rechazar propuestas
- ✅ Acceso a dashboard y equipo

**Ideal para**: Scrum Master, Tech Lead o managers

---

### 👤 Member (Miembro)
**Permisos de trabajo diario**:
- ❌ No puede editar/eliminar el proyecto
- ❌ No puede gestionar miembros
- ✅ Crear y editar sprints
- ❌ No puede eliminar sprints
- ✅ Crear y editar tareas
- ❌ No puede eliminar tareas
- ✅ Crear y editar bugs
- ❌ No puede eliminar bugs
- ✅ Crear propuestas
- ❌ No puede aprobar/rechazar propuestas
- ✅ Acceso a dashboard y equipo

**Ideal para**: Desarrolladores, QA, diseñadores

---

### 👁️ Viewer (Observador)
**Solo lectura**:
- ❌ No puede crear, editar ni eliminar nada
- ✅ Ver dashboard
- ❌ No accede a la sección de equipo

**Ideal para**: Stakeholders, clientes, observadores externos

---

## Proyectos

### Crear un Proyecto

1. Haz clic en **"Nuevo Proyecto"**
2. Completa los campos:
   - **Nombre**: Título del proyecto (3-100 caracteres)
   - **Descripción**: Contexto y objetivo (5-500 caracteres)
   - **Fecha de inicio**: Cuándo comienza (YYYY-MM-DD)
   - **Fecha de fin**: Cuándo debe completarse (YYYY-MM-DD)
   - **Estado**: `planned`, `active`, `completed` o `archived`
   - **Repositorios** (opcional): URLs de GitHub
     - Tipo: `front`, `back`, `api` o `fullstack`
     - Marcar repositorio por defecto
   - **Lenguajes** (opcional): TypeScript, Python, Go...
   - **Frameworks** (opcional): Next.js, Express, React...

3. Automáticamente te conviertes en **Owner** del proyecto

### Estados de Proyecto

- **Planned**: En planificación, aún no iniciado
- **Active**: En desarrollo activo
- **Completed**: Finalizado exitosamente
- **Archived**: Archivado, no activo

### Editar Proyecto

Solo **Owners** y **Admins** pueden editar:
- Cambiar nombre, descripción, fechas
- Actualizar estado
- Gestionar repositorios, lenguajes y frameworks

### Eliminar Proyecto

Solo el **Owner** puede eliminar un proyecto. Esta acción es **irreversible** y eliminará:
- Todos los sprints del proyecto
- Todas las tareas
- Todos los bugs
- Todas las propuestas
- Todo el historial

---

## Sprints

Los sprints son **ciclos de trabajo** con inicio y fin definidos (típicamente 2 semanas).

### Crear un Sprint

1. Dentro del proyecto, ve a la sección **Sprints**
2. Haz clic en **"Nuevo Sprint"**
3. Completa:
   - **Nombre**: "Sprint 1", "Sprint Q1 2026"...
   - **Fecha de inicio**: Cuándo comienza (YYYY-MM-DD)
   - **Fecha de fin**: Cuándo termina (YYYY-MM-DD)
   - **Estado**: `planned`, `active` o `completed`

### Estados de Sprint

- **Planned**: Planificado pero no iniciado
- **Active**: Sprint actual en progreso
- **Completed**: Finalizado

### Asignar Tareas a un Sprint

Al crear o editar una tarea, puedes seleccionar un sprint. También puedes:
- Mover múltiples tareas a la vez desde el backlog
- Reasignar tareas entre sprints
- Dejar tareas sin sprint (backlog)

### Ver Progreso del Sprint

El dashboard muestra:
- **Gráfico de burndown**: Puntos completados vs. puntos totales por día
- **Porcentaje completado**: Tareas done / tareas totales
- **Tareas por estado**: Cuántas en to-do, in-progress, etc.

---

## Tareas

Las tareas son el **corazón de Planning Task**. Cada tarea representa trabajo concreto con contexto completo.

### Crear una Tarea

1. Ve a **Tareas** o dentro de un proyecto
2. Haz clic en **"Nueva Tarea"**
3. Completa los campos obligatorios:

#### 📝 Información Básica
- **Título**: Descripción corta (3-200 caracteres)
  - Ejemplo: "Añadir autenticación con Google"

#### 👤 User Story
Define **quién**, **qué** y **para qué**:
- **Como** (who): "usuario final", "administrador"...
- **Quiero** (what): "poder iniciar sesión con Google"
- **Para** (why): "no tener que recordar otra contraseña"

Ejemplo completo:
> Como usuario final, quiero poder iniciar sesión con Google, para no tener que recordar otra contraseña y acceder más rápido.

#### ✅ Criterios de Aceptación
Lista de **condiciones** que deben cumplirse para dar la tarea por completada:
- "Botón de Google visible en pantalla de login"
- "Al hacer clic se abre el flujo OAuth de Google"
- "Después de autorizar, el usuario queda autenticado"
- "Si falla la autenticación, se muestra error claro"

Mínimo **1 criterio** requerido.

#### 📊 Puntos

**Puntos de Negocio** (bizPoints): Valor que aporta al negocio
- Usa secuencia Fibonacci: **1, 2, 3, 5, 8, 13**
- Ejemplo: Autenticación Google = 8 (mejora experiencia, reduce fricción)

**Puntos de Desarrollo** (devPoints): Esfuerzo técnico requerido
- Usa secuencia Fibonacci: **1, 2, 3, 5, 8, 13**
- Ejemplo: Autenticación Google = 5 (integración OAuth estándar)

**Prioridad automática**: `8 / 5 = 1.6` (mayor valor = mayor prioridad)

#### 🧪 Tests (Obligatorio)
Define los **tests necesarios** para validar la tarea (mínimo 1):
- **Tipo**: `unit`, `integration`, `e2e` o `manual`
- **Descripción**: "Test unitario de callback OAuth"
- **Estado**: `pending` → `passed` / `failed`

**Validaciones automáticas**:
- Para pasar a `to-validate`: Todos los tests deben estar definidos
- Para pasar a `validated` o `done`: Todos los tests deben estar en `passed`

#### 📅 Asignación (Opcional)
- **Desarrollador**: Responsable principal
- **Co-desarrollador**: Segundo desarrollador (pair programming)
- **Sprint**: A qué sprint pertenece
- **Fechas**: Inicio y fin estimadas

#### 📎 Adjuntos (Opcional)
- Sube archivos relacionados (diseños, documentos, capturas)

#### 🛠️ Plan de Implementación (Opcional para tareas complejas)
Para tareas con **devPoints ≥ 8**, puedes añadir:
- **Enfoque técnico**: Arquitectura y patrones a usar
- **Pasos ordenados**: Lista de pasos de implementación
- **Cambios en modelo de datos**: Nuevas tablas, campos
- **Cambios en API**: Nuevos endpoints, modificaciones
- **Riesgos identificados**: Posibles blockers o problemas
- **Fuera de alcance**: Qué NO incluye esta tarea

### Estados de Tarea

```
to-do → in-progress → to-validate → validated → done
```

- **to-do**: Pendiente de iniciar
- **in-progress**: En desarrollo
- **to-validate**: Esperando validación (todos los tests definidos)
- **validated**: Validada, lista para producción (todos los tests passed)
- **done**: Completada y en producción

### Editar Tareas

Puedes modificar cualquier campo de la tarea. El sistema registra:
- **Historial completo** de cambios
- Quién hizo el cambio
- Cuándo se hizo
- Valor anterior y nuevo

### Comentarios en Tareas

- Añade comentarios para discutir la tarea
- Menciona usuarios con **@usuario**
- Los mencionados reciben notificación automática
- Edita o elimina tus propios comentarios

### Priorización Automática

Las tareas se ordenan por **prioridad** (bizPoints / devPoints):
- **Alta prioridad**: Mucho valor con poco esfuerzo (ej. 13 / 3 = 4.33)
- **Baja prioridad**: Poco valor con mucho esfuerzo (ej. 2 / 8 = 0.25)

El **PLANNER** de Komodo usa esta prioridad para seleccionar la siguiente tarea.

---

## Bugs

Sistema dedicado para **reportar y gestionar bugs**.

### Crear un Bug

1. Ve a la sección **Bugs**
2. Haz clic en **"Reportar Bug"**
3. Completa:
   - **Título**: Descripción breve del problema
   - **Descripción**: Pasos para reproducir, comportamiento esperado vs. actual
   - **Severidad**: `critical`, `high`, `medium` o `low`
   - **Asignar a** (opcional): Desarrollador responsable

### Severidades

- **Critical**: Bloquea funcionalidad crítica, afecta a todos los usuarios
- **High**: Funcionalidad importante no funciona, afecta a muchos usuarios
- **Medium**: Problema molesto pero hay workaround
- **Low**: Problema cosmético o edge case

### Estados de Bug

- **open**: Reportado, pendiente de iniciar
- **in-progress**: En investigación/corrección
- **resolved**: Corregido, en testing
- **closed**: Verificado y cerrado

### Gestionar Bugs

- **Filtrar** por severidad, estado o asignado
- **Actualizar** estado conforme avanza la corrección
- **Reasignar** a otro developer
- **Eliminar** (solo Owners/Admins)

---

## Propuestas

Sistema para que **miembros propongan nuevas tareas** que requieren aprobación.

### ¿Por qué usar propuestas?

- El equipo puede sugerir mejoras sin crear tareas directamente
- Los Owners/Admins revisan y aprueban antes de añadir al backlog
- Evita el backlog inflado con tareas no validadas

### Crear una Propuesta

1. Ve a **Propuestas**
2. Haz clic en **"Nueva Propuesta"**
3. Completa (igual que una tarea):
   - Título
   - User Story (quien, qué, por qué)
   - Criterios de aceptación
   - Puntos de negocio y desarrollo
   - Fecha estimada de inicio

4. Estado: `pending` (esperando aprobación)

### Aprobar/Rechazar Propuestas

Solo **Owners** y **Admins** pueden:
- **Aceptar**: La propuesta se convierte automáticamente en tarea
- **Rechazar**: Se marca como rechazada pero se conserva el historial

### Estados de Propuesta

- **pending**: Esperando revisión
- **accepted**: Aprobada y convertida en tarea
- **rejected**: Rechazada

---

## Dashboard

El dashboard ofrece **visibilidad completa** del progreso del proyecto.

### Vista General

Al entrar al dashboard ves:
- **Tarjetas de proyecto**: Estadísticas rápidas
  - Total de tareas
  - Tareas completadas
  - Progreso en %
- **Notificaciones** recientes
- **Invitaciones** pendientes

### Gráfico de Sprint

Visualiza el **progreso por sprint**:
- **Eje X**: Sprints del proyecto
- **Eje Y**: Puntos acumulados
- **Línea morada**: Puntos de negocio completados
- **Línea cian**: Puntos de desarrollo completados

**Filtros**:
- Selecciona uno o más proyectos (mini cards con checkboxes)
- Filtra por desarrollador específico
- Solo cuenta tareas en estado `done`

**Estadísticas globales**:
- Proyectos seleccionados
- Tareas totales
- Mis tareas completadas

### Gráfico de Performance de Desarrolladores

Dos gráficos sincronizados con los filtros de proyecto:

**Gráfico de barras**: Tareas completadas vs. pendientes por developer
- Verde: Tareas done
- Gris: Tareas pendientes (to-do, in-progress, to-validate, validated)

**Gráfico de tarta**: Distribución de carga de trabajo
- Porcentaje de tareas asignadas a cada developer
- Solo proyectos seleccionados

### Dashboard de Proyecto Individual

Dentro de cada proyecto hay métricas específicas:
- Tareas por estado (to-do, in-progress, to-validate, validated, done)
- Porcentaje de completado
- Carga de trabajo por developer
- Bugs abiertos por severidad
- Progreso de sprints

---

## Komodo - Automatización

**Komodo** es un sistema de **automatización** que usa agentes inteligentes para acelerar el desarrollo.

### ¿Qué hace Komodo?

Ejecuta el **ciclo completo** de desarrollo de forma automatizada:

1. **PLANNER** → Analiza el backlog y selecciona la tarea de mayor prioridad
2. **CODER** → Genera el código, crea branch, commitea y abre Pull Request
3. **REVIEWER** → Hace code review automático con 8 criterios de calidad
4. **CODER (fix)** → Corrige issues encontrados por el reviewer
5. **REVIEWER (re-review)** → Valida que los issues estén resueltos
6. **Merge** → Si todo está correcto, hace merge automático

### Dashboard de Komodo

Accede a `/komodo` para ver:

#### Tarea Actual
- **Título** de la tarea en ejecución
- **User Story**: Como... quiero... para...
- **Desarrollador** asignado
- **Puntos** de negocio y desarrollo
- **Estado** actual

#### Estado de Ejecución
- **Running**: Komodo trabajando activamente
- **Stopped**: Detenido, esperando comando
- **Paused**: Pausado temporalmente

#### Fase Actual
- **Planning**: Seleccionando siguiente tarea
- **Coding**: Generando código
- **Reviewing**: Haciendo code review
- **Merging**: Integrando cambios

#### Actividad de Agentes

Visualiza **en tiempo real** qué hace cada agente:
- **PLANNER**: "Seleccionó tarea: Añadir autenticación Google (prioridad 1.6)"
- **CODER**: "Creando código para autenticación OAuth..."
- **REVIEWER**: "Revisando PR #42 - Encontrados 3 issues: naming inconsistente, falta error handling..."

Cada log muestra:
- **Hora** exacta
- **Tipo** de evento (tool, status, text)
- **Detalle** de la acción

### Página de Agentes

En `/komodo/agents` ves estadísticas detalladas:

**Por cada agente**:
- **Status**: idle, working, done
- **Total de turnos**: Interacciones con la API
- **Tareas completadas**: Cuántas ha procesado
- **Costo total**: USD gastado en API calls
- **Tiempo de actividad**: Tiempo trabajando
- **CLI** utilizado
- **Modelo** de IA (Opus, Sonnet, Haiku)
- **Browser validation**: Si valida en navegador
- **Live log**: Últimas 5 acciones del agente

### Memoria de Komodo

En `/komodo/memory` se almacenan:
- **Patterns**: Patrones de código aprendidos
- **Reviews**: Historial de code reviews
- **Lessons learned**: Aprendizajes de errores previos

Esto mejora la calidad del código generado con el tiempo.

### Comandos de Control

Desde el dashboard puedes:
- **Pause**: Pausar ejecución después de la tarea actual
- **Stop**: Detener completamente
- **Resume** (si está pausado): Continuar

### Configuración

Komodo lee configuración de variables de entorno:
- `KOMODO_PROJECT_ID`: ID del proyecto por defecto
- `AUTO_MERGE`: true/false para merge automático
- `MAX_REVIEW_CYCLES`: Máximo de ciclos review-fix
- `KOMODO_MEMORY_PATH`: Ruta a archivo de memoria

---

## Equipo e Invitaciones

### Ver Miembros del Equipo

En `/team` ves:
- **Lista de miembros** del proyecto
- **Rol** de cada uno (Owner, Admin, Member, Viewer)
- **Fecha** de incorporación

### Invitar Miembros

Solo **Owners** y **Admins** pueden invitar:

1. Haz clic en **"Invitar Miembro"**
2. Introduce el **email** del usuario
3. Selecciona el **rol** inicial (Admin, Member o Viewer)
4. Envía la invitación

El usuario recibirá:
- **Notificación** en su panel
- **Email** con enlace (si está configurado)

### Aceptar/Rechazar Invitaciones

Como usuario invitado:

1. Ve a tu **Dashboard**
2. Verás un botón **"Invitaciones"** con contador
3. Abre el modal de invitaciones
4. Para cada invitación puedes:
   - **Aceptar**: Te unes al proyecto con el rol asignado
   - **Rechazar**: Declinas la invitación

### Cambiar Rol de Miembro

**Owners** y **Admins** pueden cambiar roles:
- Selecciona el miembro
- Cambia su rol a Owner, Admin, Member o Viewer
- Los permisos se actualizan inmediatamente

**Nota**: No puedes cambiar el rol del Owner original del proyecto.

### Eliminar Miembros

**Owners** y **Admins** pueden remover miembros:
- El miembro pierde acceso al proyecto
- Sus tareas asignadas NO se eliminan
- Puede ser re-invitado posteriormente

---

## Notificaciones

Planning Task te notifica automáticamente sobre eventos importantes.

### Tipos de Notificaciones

#### 📋 Tareas
- Te asignaron una tarea
- Cambió el estado de tu tarea
- Comentaron en una tarea tuya
- Te mencionaron en un comentario

#### 🎯 Sprints
- Se creó un nuevo sprint
- Un sprint cambió de estado

#### 🐛 Bugs
- Te asignaron un bug
- Un bug crítico fue reportado

#### 👥 Equipo
- Te invitaron a un proyecto
- Alguien se unió al proyecto
- Cambiaron tu rol en un proyecto

#### ✅ Propuestas
- Tu propuesta fue aprobada
- Tu propuesta fue rechazada
- Nueva propuesta pendiente (si eres Owner/Admin)

### Ver Notificaciones

1. Haz clic en el **icono de campana** en el header
2. Verás:
   - **Contador** de no leídas
   - **Lista** de notificaciones recientes
   - **Botón** "Marcar todas como leídas"

### Gestionar Notificaciones

- **Clic en notificación**: Te lleva al elemento relacionado y la marca como leída
- **Marcar como leída**: Sin navegar
- **Limpiar todas**: Elimina todas las notificaciones

---

## Perfil de Usuario

### Ver Perfil

En `/profile` ves:
- **Foto de perfil**
- **Nombre** (displayName)
- **Email**
- **UID** (identificador único)

### Editar Perfil

Puedes actualizar:
- **Foto de perfil**: Sube una imagen nueva
- **Nombre para mostrar**: Cómo te ven otros usuarios

**Nota**: No puedes cambiar tu email (autenticación por Firebase).

### Cerrar Sesión

Botón **"Cerrar Sesión"** en el perfil o header.

---

## Calendario

La sección **Calendario** (en desarrollo) mostrará:
- Sprints en timeline
- Deadlines de tareas
- Eventos del equipo
- Fechas clave del proyecto

---

## Flujos de Trabajo Típicos

### Flujo 1: Product Owner planifica sprint

1. **Crea proyecto** con nombre, descripción y fechas
2. **Invita al equipo** (developers, QA, etc.)
3. **Crea tareas** con User Stories, puntos y criterios de aceptación
4. Las tareas se **priorizan automáticamente** por ROI
5. **Crea un sprint** con fechas
6. **Asigna tareas** al sprint
7. **Monitorea progreso** en el dashboard

### Flujo 2: Developer trabaja en tarea

1. Ve el **backlog** ordenado por prioridad
2. **Toma la siguiente tarea** (cambia a in-progress)
3. **Lee User Story** y criterios de aceptación
4. **Desarrolla** la funcionalidad
5. **Ejecuta tests** y los marca como passed
6. **Cambia estado** a to-validate
7. **QA valida** y cambia a validated
8. **Owner hace deploy** y cambia a done
9. **Komodo hace todo esto automáticamente** si está configurado

### Flujo 3: Team member propone mejora

1. **Crea una propuesta** con título, user story y puntos
2. Owner/Admin recibe **notificación**
3. Owner **revisa** la propuesta en el dashboard
4. Si aporta valor, la **aprueba** → se convierte en tarea
5. Si no es prioritaria, la **rechaza** con comentario

### Flujo 4: QA reporta bug

1. **Crea un bug** con severidad y descripción detallada
2. Bug se **asigna automáticamente** o manualmente
3. Developer cambia estado a **in-progress**
4. Corrige el bug y cambia a **resolved**
5. QA verifica y cambia a **closed**

### Flujo 5: Komodo automatiza desarrollo

1. **Configura Komodo** con el proyecto target
2. **Ejecuta** `komodo run`
3. **PLANNER** selecciona tarea de mayor prioridad
4. **CODER** genera código, crea branch y PR
5. **REVIEWER** hace code review (8 criterios)
6. Si hay issues, **CODER** corrige y pushea
7. **REVIEWER** re-valida
8. Si todo OK, hace **merge** automático
9. Tarea se marca como **done**
10. **Repite** con siguiente tarea

---

## Consejos y Mejores Prácticas

### 📊 Puntos
- **Sé consistente**: Calibra con el equipo qué significa cada número
- **Reevalúa**: Si subestimaste, actualiza los puntos para aprender
- **Usa puntos relativos**: No horas absolutas (5 puntos = "como la tarea X que hicimos")

### ✍️ User Stories
- **Enfócate en el valor**: No en la implementación técnica
- **Sé específico**: "Como usuario final" vs. "Como admin de sistemas"
- **Incluye el beneficio**: El "para qué" justifica el "qué"

### ✅ Criterios de Aceptación
- **Observables**: Deben ser verificables objetivamente
- **Completos**: Si faltan criterios, añádelos al descubrir casos edge
- **Claros**: Cualquiera del equipo debe entenderlos

### 🎯 Sprints
- **Capacidad realista**: No sobrecargues el sprint (usa velocity del sprint anterior)
- **Buffer**: Deja 20% para imprevistos
- **Daily**: Revisa progreso diariamente y reasigna si es necesario

### 🐛 Bugs
- **Reporta rápido**: Cuanto antes se detecta, más barato es corregir
- **Prioriza severidad**: Critical primero, low después
- **Incluye pasos**: Cómo reproducir el bug paso a paso

### 🤝 Colaboración
- **Comenta frecuentemente**: Mantén al equipo informado
- **Menciona con @**: Notifica a quien necesite saber
- **Usa propuestas**: Para ideas que necesitan validación antes de comprometer trabajo

### 🤖 Komodo
- **Empieza con tareas simples**: Deja que Komodo aprenda patrones de tu código
- **Revisa PRs**: Aunque sean automáticos, valida que el código siga tus estándares
- **Ajusta memoria**: Si Komodo repite errores, actualiza la memoria con el patrón correcto

---

## Soporte

Si tienes preguntas o encuentras problemas:

1. **Consulta esta guía** primero
2. **Habla con tu Owner/Admin** del proyecto
3. **Reporta un bug** si encuentras un error en la plataforma
4. **Revisa el changelog** (botón en dashboard) para nuevas features

---

**Versión del documento**: 1.0
**Última actualización**: 4 de marzo de 2026
**Plataforma**: Planning Task v1.47.2
