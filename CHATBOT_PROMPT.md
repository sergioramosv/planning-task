# Sistema de Chatbot para Planning Task Web

## Objetivo
Integrar un chatbot dentro de la web de planning-task (Next.js) que:
- **Parezca una terminal de Claude Code** (interfaz oscura, texto monoespacio)
- **Acepte comandos en lenguaje natural** sobre gestión de tareas
- **Se comunique con Claude Code local** a través de MCP (planning-task-mcp)
- **Muestre respuestas formateadas** con estado de ejecución (✓ Hecho / ✗ Error)
- **Mantenga historial de conversación** en la sesión
- **Integre con Firebase** existente para persistencia

---

## Arquitectura

### Frontend (Next.js)
```
components/
├── chatbot/
│   ├── ChatbotInterface.tsx      # Componente principal
│   ├── ChatbotInput.tsx           # Input con estilos terminal
│   ├── ChatbotMessage.tsx         # Mensaje individual (usuario/sistema)
│   ├── ChatbotHistory.tsx         # Historial scrollable
│   └── chatbot.module.css         # Estilos terminal oscuro
└── ...
```

### Backend (API Route)
```
app/api/
├── chatbot/
│   ├── route.ts                   # Endpoint principal
│   ├── claude-executor.ts         # Ejecuta comandos en Claude Code
│   └── command-parser.ts          # Parsea input natural → MCP commands
```

---

## Flujo de Ejecución

```
1. Usuario escribe: "crea una tarea llamada Implementar login"
   ↓
2. Frontend → POST /api/chatbot/execute
   {
     "message": "crea una tarea llamada Implementar login",
     "projectId": "xyz123",
     "context": { ... }
   }
   ↓
3. Backend:
   - Parsea con command-parser.ts
   - Convierte a comando MCP: "create_task"
   - Ejecuta a través de Claude Code local
   ↓
4. Claude Code procesa la tarea
   - Usa planning-task-mcp
   - Devuelve resultado JSON
   ↓
5. Backend responde al frontend:
   {
     "status": "success",
     "message": "✓ Tarea creada: Implementar login (ID: task-xyz)",
     "data": { taskId, title, ... }
   }
   ↓
6. Frontend muestra resultado en chatbot
   - Actualiza UI
   - Agrega mensaje al historial
```

---

## Especificaciones Técnicas

### 1. Componente ChatbotInterface.tsx

**Props:**
```typescript
interface ChatbotProps {
  projectId: string;
  userId: string;
  onTaskCreated?: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
}
```

**Features:**
- Input textbox con Enter para enviar
- Historial scrollable (auto-scroll al final)
- Indicador de "escribiendo..."
- Soporte para comandos predefinidos (botones rápidos)
- Limpieza de historial con `/clear`
- Ayuda con `/help`

### 2. Estilos (Terminal Style)

```css
/* Color scheme */
background: #0d1117          /* GitHub dark */
text-color: #c9d1d9         /* Light gray */
accent: #58a6ff             /* Claude blue */
success: #3fb950            /* Green */
error: #f85149              /* Red */
warning: #d29922            /* Orange */

/* Fuentes */
font-family: "Fira Code", "Courier New", monospace
font-size: 13px
line-height: 1.6
```

### 3. Comandos Soportados

#### Crear Tarea
```
"crea una tarea llamada [nombre]"
"crear tarea: [nombre]"
"new task: [nombre]"
```
→ Abre modal con form o pregunta interactiva por aceptacion criteria

#### Listar Tareas
```
"lista las tareas"
"mostrar tareas del proyecto"
"list tasks"
```
→ Devuelve tabla formateada en el chatbot

#### Actualizar Tarea
```
"actualiza la tarea [id] a [status]"
"cambiar estado tarea [id] a in-progress"
"update task [id]"
```

#### Eliminar Tarea
```
"elimina la tarea [id]"
"delete task [id]"
"remove task [id]"
```

#### Comandos Meta
```
"/help"              → Muestra lista de comandos disponibles
"/clear"             → Limpia historial del chatbot
"/export"            → Exporta conversación a JSON/PDF
"/settings"          → Abre settings del chatbot
```

---

## Integración con Claude Code Local

### Cómo se conecta:

1. **En app/api/chatbot/claude-executor.ts:**
   ```typescript
   // Envía JSON al MCP server
   const mcpCommand = {
     method: "tools/call",
     params: {
       name: "create_task",  // o list_tasks, update_task, etc
       arguments: {
         projectId,
         title,
         acceptanceCriteria,
         userStory: { who, what, why },
         developer,
         startDate,
         bizPoints,
         devPoints,
         status,
         createdBy: userId
       }
     }
   };

   // Comunica con planning-task-mcp (local)
   const response = await callMCPServer(mcpCommand);
   ```

2. **MCP Server** (planning-task-mcp):
   - Ya tienes `src/index.ts` con herramientas
   - Backend se conecta a `localhost:9000` (o puerto configurado)
   - Devuelve resultado JSON

3. **Respuesta al usuario:**
   ```
   ✓ Tarea creada: "Implementar login"
   ID: -KkxvV2gKsO1Zf8q9L0m
   Sprint: 0
   Dev Points: 5
   ```

---

## Implementación Step-by-Step

### Fase 1: Frontend Base
- [ ] Crear componente ChatbotInterface.tsx
- [ ] Crear ChatbotInput.tsx con estilos
- [ ] Crear ChatbotMessage.tsx para mensajes
- [ ] Agregar chatbot.module.css con tema terminal
- [ ] Integrar en dashboard page

### Fase 2: Backend
- [ ] Crear /api/chatbot/route.ts
- [ ] Crear command-parser.ts (parsea input natural)
- [ ] Crear claude-executor.ts (conecta con MCP)
- [ ] Manejo de errores y validación

### Fase 3: Integración MCP
- [ ] Conectar a planning-task-mcp server
- [ ] Mapear comandos → herramientas MCP
- [ ] Testear CRUD operations

### Fase 4: UX Avanzada
- [ ] Historial persistente (localStorage)
- [ ] Comandos rápidos (botones)
- [ ] Autocomplete
- [ ] Exportar conversación

---

## Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_MCP_SERVER_URL=http://localhost:9000
NEXT_PUBLIC_ENABLE_CHATBOT=true
MCP_PROJECT_ID=your-project-id
CHATBOT_MAX_HISTORY=100
```

---

## Stack Recomendado

- **Frontend:** React + TypeScript
- **HTTP:** fetch API o axios
- **Validación:** Zod (ya tienes en proyecto)
- **UI:** Lucide Icons (ya tienes)
- **Feedback:** react-hot-toast (ya tienes)
- **Persistencia:** localStorage + Firebase

---

## Ejemplo de Conversación

```
> crea una tarea para implementar autenticación

Claude Code is executing...

✓ Task created successfully
   Title: implementar autenticación
   ID: -KkxvV2gKsO1Zf8q9L0m
   Sprint: 0
   Status: to-do
   Dev Points: 8

> lista las tareas del sprint 0

Claude Code is executing...

✓ Found 7 tasks in Sprint 0

| ID        | Title                              | Status    | Points |
|-----------|-----------------------------------|-----------|---------|
| task-001  | Setup project infrastructure      | to-do     | 5      |
| task-002  | Configure Firebase              | in-progress | 5      |
| task-003  | implementar autenticación       | to-do     | 8      |
...

> actualiza tarea task-002 a done

Claude Code is executing...

✓ Task updated
   Title: Configure Firebase
   Status: done (was: in-progress)
   Updated: 2026-02-17 22:15:32

> /help

Available commands:
  - create task: [name] → Crea una nueva tarea
  - list tasks [sprint] → Lista tareas
  - update task [id] to [status] → Actualiza estado
  - delete task [id] → Elimina tarea
  - /clear → Limpia historial
  - /export → Exporta conversación
  - /help → Muestra esta ayuda
```

---

## Notas Importantes

1. **Seguridad:**
   - Valida `projectId` en backend
   - Verifica permisos del usuario
   - Sanitiza input (ya tienes en security.ts del MCP)

2. **Performance:**
   - Debounce en input (300ms)
   - Lazy load del componente si es pesado
   - Cache de comandos frecuentes

3. **Error Handling:**
   - MCP server no disponible → Mostrar error claro
   - Timeout después de 10s
   - Retry automático con backoff exponencial

4. **Testing:**
   - Unit tests para command-parser.ts
   - Mock del MCP server
   - E2E con Playwright

---

## Próximos Pasos

1. Confirma esto te late ✓
2. Empieza con el componente frontend
3. Luego el backend API
4. Finalmente integración con MCP
