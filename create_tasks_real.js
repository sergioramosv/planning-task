#!/usr/bin/env node

/**
 * Script para crear REALMENTE todas las tareas en Firebase via MCP
 * Este script se conecta al MCP server via stdio
 */

const { spawn } = require('child_process');
const path = require('path');

const PROJECT_ID = '-OlgtvBsWKXNfOyQFBRf';
const MCP_DIR = path.join(__dirname, 'mcp');

// Todas las tareas
const TASKS = [
  {
    title: '[BACK-01] Inicialización de Proyecto y Entorno',
    acceptanceCriteria: [
      'Repositorio creado como monorepo con workspaces',
      'Next.js 14+ instalado con App Router funcionando',
      'TypeScript compila sin errores',
      'ESLint está configurado y detecta 5+ reglas',
      'Prettier formatea código correctamente',
      'npm run lint no tiene errores',
      'npm run build completa exitosamente'
    ],
    userStory: {
      who: 'Developer',
      what: 'configurar el proyecto base con todas las herramientas',
      why: 'tener un foundation sólido para el resto del desarrollo'
    },
    bizPoints: 50,
    devPoints: 5
  },
  {
    title: '[DB-01] Dockerización de Base de Datos',
    acceptanceCriteria: [
      'docker-compose.yml creado en la raíz del proyecto',
      'PostgreSQL 15+ configurado en docker-compose',
      'Puertos expuestos correctamente (5432)',
      'docker-compose up levanta la BD sin errores',
      'Volumen postgres_data persiste datos entre reinicios',
      'POSTGRES_PASSWORD configurada desde .env',
      'psql conecta exitosamente a localhost:5432'
    ],
    userStory: {
      who: 'Developer',
      what: 'levantar PostgreSQL en Docker localmente',
      why: 'tener una BD local sin instalar PostgreSQL manualmente'
    },
    bizPoints: 40,
    devPoints: 3
  },
  {
    title: '[DB-02] Schema Prisma: Users & Tenants',
    acceptanceCriteria: [
      'Modelo User con id, email, password, tenantId',
      'Modelo Tenant con id, name, subdomain',
      'Relación 1:N Tenant > User',
      'Validación email único global',
      'Validación subdomain único',
      'npx prisma migrate dev crea tablas',
      'npx prisma studio funciona sin errores'
    ],
    userStory: {
      who: 'Developer',
      what: 'definir estructura base de datos',
      why: 'tener usuarios y tenants con relación correcta'
    },
    bizPoints: 60,
    devPoints: 5
  },
  {
    title: '[API-01] CRUD Tenants',
    acceptanceCriteria: [
      'POST /api/tenants crea tenant',
      'GET /api/tenants lista tenants',
      'GET /api/tenants/:id obtiene tenant',
      'PUT /api/tenants/:id actualiza tenant',
      'DELETE /api/tenants/:id elimina tenant',
      'Validación de campos requeridos',
      'Manejo de errores 400, 404, 500'
    ],
    userStory: {
      who: 'User',
      what: 'crear y gestionar mis tenants',
      why: 'tener múltiples espacios de trabajo'
    },
    bizPoints: 50,
    devPoints: 3
  },
  {
    title: '[AWS-01] Configuración de Cliente S3/R2',
    acceptanceCriteria: [
      'Cliente AWS S3 configurado con credenciales',
      'Alternativa Cloudflare R2 compatible',
      'Variables de entorno: AWS_KEY, AWS_SECRET, BUCKET',
      'Cliente reutilizable en toda la app',
      'Tests unitarios para cliente',
      'Error handling para credenciales inválidas',
      'Logging de operaciones'
    ],
    userStory: {
      who: 'Developer',
      what: 'configurar cliente de almacenamiento',
      why: 'poder guardar archivos en la nube'
    },
    bizPoints: 45,
    devPoints: 3
  },
  {
    title: '[AWS-02] Utilidad uploadStringAsFile',
    acceptanceCriteria: [
      'Función uploadStringAsFile(content, filename)',
      'Convierte string a Blob',
      'Sube a S3/R2 con timestamp',
      'Retorna URL pública del archivo',
      'Manejo de errores de upload',
      'Validación de tamaño máximo (10MB)',
      'Tests unitarios'
    ],
    userStory: {
      who: 'Developer',
      what: 'subir código generado a la nube',
      why: 'almacenar componentes de usuarios'
    },
    bizPoints: 40,
    devPoints: 2
  },
  {
    title: '[AWS-03] Utilidad getFileContent',
    acceptanceCriteria: [
      'Función getFileContent(url)',
      'Descarga contenido del archivo desde S3/R2',
      'Retorna string/Buffer según tipo',
      'Caching opcional (Redis/Memory)',
      'Manejo de errores 404, timeout',
      'Timeout máximo 5 segundos',
      'Tests unitarios'
    ],
    userStory: {
      who: 'Developer',
      what: 'descargar código almacenado',
      why: 'renderizar componentes en runtime'
    },
    bizPoints: 40,
    devPoints: 2
  },
  {
    title: '[UI-01] Layout del Editor',
    acceptanceCriteria: [
      'Layout de 3 columnas: sidebar, canvas, propiedades',
      'Sidebar: árbol de componentes',
      'Canvas: área de edición central',
      'Panel derecho: propiedades seleccionadas',
      'Responsive en mobile (fullscreen editor)',
      'CSS Modules para estilos',
      'No usar Tailwind'
    ],
    userStory: {
      who: 'User',
      what: 'ver el editor con los paneles principales',
      why: 'poder empezar a crear componentes'
    },
    bizPoints: 70,
    devPoints: 5
  },
  {
    title: '[ED-01] Estado Global del Editor (Zustand/Context)',
    acceptanceCriteria: [
      'Store con estado de componentes (tree)',
      'Métodos: addComponent, removeComponent, selectComponent',
      'Métodos: updateComponentProps, moveComponent',
      'Hook useEditor para acceder al estado',
      'Persistencia en localStorage',
      'DevTools integradas',
      'Tests unitarios del store'
    ],
    userStory: {
      who: 'Developer',
      what: 'tener estado global del editor',
      why: 'sincronizar cambios entre paneles'
    },
    bizPoints: 60,
    devPoints: 5
  },
  {
    title: '[ED-02] Componente Draggable Base',
    acceptanceCriteria: [
      'Componente <Draggable> envuelve elementos',
      'onDragStart captura datos del componente',
      'Visual feedback al draggear (opacity, cursor)',
      'dataTransfer.setData con JSON del componente',
      'Funciona anidado',
      'Sin librerías externas (HTML5 API)',
      'Tests en React Testing Library'
    ],
    userStory: {
      who: 'User',
      what: 'arrastrar componentes de la librería',
      why: 'poder mover componentes de forma intuitiva'
    },
    bizPoints: 50,
    devPoints: 3
  },
  {
    title: '[ED-03] Drop Zone Canvas',
    acceptanceCriteria: [
      'Canvas tiene dragover listener activo',
      'Canvas tiene drop listener que agrega componente',
      'Feedback visual mientras se arrastra sobre canvas (borde/sombra)',
      'preventDefault() en dragover',
      'Componente soltado se agrega al Store',
      'Posición del componente se guarda (coordenadas)',
      'Drop en área vacía agrega componente en raíz'
    ],
    userStory: {
      who: 'User',
      what: 'soltar componentes en el canvas',
      why: 'poder construir interfaces visuales'
    },
    bizPoints: 55,
    devPoints: 4
  },
  {
    title: '[ED-04] Renderizado Recursivo en Editor',
    acceptanceCriteria: [
      'EditorRenderer recorre Store.getState().tree',
      'Pinta componentes recursivamente en canvas',
      'Actualización en tiempo real al agregar componentes',
      'Componentes anidados renderizados correctamente',
      'onClick en componente lo selecciona',
      'isSelected determina visualmente cuál está activo',
      'Componentes removidos desaparecen inmediatamente'
    ],
    userStory: {
      who: 'User',
      what: 'ver los componentes que he agregado renderizados',
      why: 'poder obtener feedback visual inmediato'
    },
    bizPoints: 65,
    devPoints: 4
  },
  {
    title: '[ED-05] Panel de Propiedades - Texto',
    acceptanceCriteria: [
      'Input text en panel derecho para editar contenido',
      'Input vacío si no hay componente seleccionado',
      'onChange dispara updateComponentProps',
      'Cambios se ven en tiempo real en canvas',
      'Inputs para: text, placeholder, label',
      'Validación de campos vacíos',
      'Disabled si no hay componente seleccionado'
    ],
    userStory: {
      who: 'User',
      what: 'editar el contenido de texto del componente',
      why: 'personalizar el texto mostrado'
    },
    bizPoints: 45,
    devPoints: 2
  },
  {
    title: '[ED-06] Panel de Propiedades - Estilos',
    acceptanceCriteria: [
      'Panel con inputs para color, tamaño, padding',
      'Select para familia de fuente',
      'Slider para tamaño de fuente (12-48px)',
      'Color picker para color de fondo',
      'Color picker para color de texto',
      'Live preview de cambios en canvas',
      'Reset a valores por defecto'
    ],
    userStory: {
      who: 'User',
      what: 'personalizar estilos visuales',
      why: 'hacer componentes únicos y atractivos'
    },
    bizPoints: 50,
    devPoints: 3
  },
  {
    title: '[COMP-01] Generador de CSS',
    acceptanceCriteria: [
      'Función generateCSS(componentTree) → string',
      'Convierte estilos del tree a CSS válido',
      'Genera clases con nombres únicos',
      'Soporta flexbox, grid, positioning',
      'CSS Modules compatible',
      'Minificado en producción',
      'Tests para diferentes estilos'
    ],
    userStory: {
      who: 'Developer',
      what: 'generar CSS a partir del árbol de componentes',
      why: 'exportar código que funcione independientemente'
    },
    bizPoints: 70,
    devPoints: 5
  },
  {
    title: '[COMP-02] Generador de TSX',
    acceptanceCriteria: [
      'Función generateTSX(componentTree) → string',
      'Convierte árbol a código React válido',
      'Importaciones automáticas de componentes',
      'Props tipados con TypeScript',
      'Formato Prettier compatible',
      'Exports como default + named',
      'Tests para diferentes estructuras'
    ],
    userStory: {
      who: 'Developer',
      what: 'generar código TSX desde el editor',
      why: 'poder descargar y usar los componentes'
    },
    bizPoints: 75,
    devPoints: 5
  },
  {
    title: '[DB-03] Schema Prisma: Projects & Deployments',
    acceptanceCriteria: [
      'Modelo Project con id, tenantId, name, description',
      'Modelo Deployment con id, projectId, version, code, css',
      'Relación 1:N Tenant > Project',
      'Relación 1:N Project > Deployment',
      'Deployment.active: Boolean para versión activa',
      'Timestamps: createdAt, updatedAt',
      'Índices para queries frecuentes'
    ],
    userStory: {
      who: 'Developer',
      what: 'almacenar proyectos y versiones',
      why: 'guardar cambios y poder hacer rollback'
    },
    bizPoints: 60,
    devPoints: 4
  },
  {
    title: '[BACK-02] API Publicar Proyecto',
    acceptanceCriteria: [
      'POST /api/projects/:id/publish recibe { code, css }',
      'Valida código y CSS antes de guardar',
      'Genera nueva Deployment entry',
      'Sube archivos a S3/R2 con versionado',
      'Marca anterior deployment como inactivo',
      'Nueva deployment pasa a activa',
      'Retorna { deploymentId, version, url }'
    ],
    userStory: {
      who: 'User',
      what: 'publicar mi proyecto para que se vea online',
      why: 'poner en producción lo que he creado'
    },
    bizPoints: 80,
    devPoints: 4
  },
  {
    title: '[BACK-03] Orquestador de Publicación',
    acceptanceCriteria: [
      'Orquesta: validación → upload → DB → activación',
      'Manejo de transacciones (rollback si falla)',
      'Retry logic para uploads fallidos',
      'Logs detallados de cada paso',
      'Caché invalidation de CDN',
      'Webhooks para notificaciones',
      'Tests de escenarios de error'
    ],
    userStory: {
      who: 'Developer',
      what: 'orquestar el proceso de publicación',
      why: 'garantizar consistencia y confiabilidad'
    },
    bizPoints: 85,
    devPoints: 5
  },
  {
    title: '[NET-01] Configuración de Wildcard Subdomains',
    acceptanceCriteria: [
      'DNS configurado con *.example.com',
      'Certificado SSL wildcard válido',
      'Node/nginx redirige peticiones a aplicación',
      'X-Forwarded-Host detecta subdominio',
      'Subdominio extraído del header Host',
      'Validación de subdominio válido (alphanumeric + -)',
      'Tests de múltiples subdomainios'
    ],
    userStory: {
      who: 'DevOps',
      what: 'configurar wildcard subdomains',
      why: 'cada proyecto en su propio subdominio'
    },
    bizPoints: 55,
    devPoints: 3
  },
  {
    title: '[MID-01] Middleware de Identificación',
    acceptanceCriteria: [
      'Middleware extrae subdominio del header Host',
      'Busca Deployment.active para ese subdominio',
      'Retorna error 404 si no encuentra subdominio',
      'Almacena deployment en req.context',
      'Se ejecuta antes de todas las rutas',
      'Performance < 50ms',
      'Caching de lookups (Redis/Memory)'
    ],
    userStory: {
      who: 'Developer',
      what: 'identificar qué proyecto se está visitando',
      why: 'servir el código correcto en cada subdominio'
    },
    bizPoints: 50,
    devPoints: 3
  },
  {
    title: '[DB-04] Resolver Deployment Activo',
    acceptanceCriteria: [
      'Función resolveDeployment(subdomain) → Deployment',
      'Query: Deployment.active = true AND Project.subdomain = ?',
      'Caching en memoria con TTL 5 min',
      'Invalidar cache en cada nueva publicación',
      'Manejo de caso: subdominio no existe',
      'Performance < 10ms con cache',
      'Tests unitarios'
    ],
    userStory: {
      who: 'Developer',
      what: 'resolver rápidamente qué deployment mostrar',
      why: 'responder rápido a cada request'
    },
    bizPoints: 55,
    devPoints: 3
  },
  {
    title: '[SSR-01] Ruta Dinámica [...slug]',
    acceptanceCriteria: [
      'Ruta /app/[...slug] en Next.js',
      'Catchea todas las rutas del sitio dinámico',
      'Parámetro slug contiene la ruta solicitada',
      'Se ejecuta en servidor (SSR)',
      'Acceso a req.context.deployment',
      'Retorna 404 si no hay deployment',
      'Tests de múltiples rutas'
    ],
    userStory: {
      who: 'Developer',
      what: 'capturar todas las rutas dinámicas',
      why: 'servir sitios con cualquier estructura URL'
    },
    bizPoints: 60,
    devPoints: 3
  },
  {
    title: '[SSR-02] Fetching de Código',
    acceptanceCriteria: [
      'Descarga deployment.code desde S3/R2',
      'Descarga deployment.css desde S3/R2',
      'Parsing del código JSON a estructura React',
      'Error handling si archivos no existen',
      'Timeout máximo 3 segundos',
      'Caching de código (Redis/Memory)',
      'Tests de parsing'
    ],
    userStory: {
      who: 'Developer',
      what: 'obtener el código guardado del deployment',
      why: 'poder renderizar el sitio en el servidor'
    },
    bizPoints: 55,
    devPoints: 3
  },
  {
    title: '[SSR-03] Integración next-mdx-remote',
    acceptanceCriteria: [
      'Usa next-mdx-remote/rsc para SSR',
      'Renderiza código descargado como JSX',
      'Componentes del árbol mapeados a React components',
      'Props inyectadas correctamente',
      'HTML seguro (no XSS)',
      'Streaming de contenido',
      'Tests de rendering'
    ],
    userStory: {
      who: 'Developer',
      what: 'renderizar el código como React en el servidor',
      why: 'obtener HTML renderizado lista para enviar'
    },
    bizPoints: 70,
    devPoints: 5
  },
  {
    title: '[SSR-04] Inyección de CSS',
    acceptanceCriteria: [
      'Inyecta CSS descargado en <head>',
      'Tag <style> con atributo scoped',
      'CSS classes mapeado a IDs únicos',
      'No conflictos entre múltiples deployments',
      'Performance: CSS inline < 50KB',
      'Fallback a <link> si CSS > 50KB',
      'Tests de inyección'
    ],
    userStory: {
      who: 'Developer',
      what: 'aplicar estilos en el HTML renderizado',
      why: 'que el sitio se vea con los colores correctos'
    },
    bizPoints: 50,
    devPoints: 2
  },
  {
    title: '[DB-05] Schema Prisma: Marketplace',
    acceptanceCriteria: [
      'Modelo Component con id, tenantId, name, description',
      'Modelo ComponentVersion con componentId, code, css',
      'Modelo ComponentInstall con targetProjectId, sourceComponentId',
      'Relación 1:N para versiones y instancias',
      'Metadata: downloads, rating, tags',
      'Timestamps de creación y actualización',
      'Índices para búsqueda y popularidad'
    ],
    userStory: {
      who: 'Developer',
      what: 'tener estructura para marketplace',
      why: 'poder compartir componentes entre proyectos'
    },
    bizPoints: 60,
    devPoints: 4
  },
  {
    title: '[MKT-01] API Publicar Componente',
    acceptanceCriteria: [
      'POST /api/components crea componente',
      'Guarda código y CSS del componente',
      'Validación de nombre único por tenant',
      'Tags, descripción, thumbnail',
      'Versioning automático (v1, v2...)',
      'GET /api/components/marketplace lista públicos',
      'Tests de validación'
    ],
    userStory: {
      who: 'User',
      what: 'publicar un componente en el marketplace',
      why: 'compartir mi trabajo y ganar créditos'
    },
    bizPoints: 75,
    devPoints: 4
  },
  {
    title: '[SEC-01] Validador de Código (Sanitizer)',
    acceptanceCriteria: [
      'Función validateCode(code) → boolean',
      'Rechaza código con eval, Function, dangerouslySetInnerHTML',
      'Solo permite componentes React seguros',
      'Whitelist de librerías permitidas',
      'Detección de patrones XSS comunes',
      'Logging de intentos bloqueados',
      'Tests de seguridad'
    ],
    userStory: {
      who: 'Admin',
      what: 'validar que el código sea seguro',
      why: 'proteger la plataforma de código malicioso'
    },
    bizPoints: 70,
    devPoints: 5
  },
  {
    title: '[AST-01] Parser de AST',
    acceptanceCriteria: [
      'Parser convierte string de código a AST',
      'Usa @babel/parser o similar',
      'Identifica: imports, exports, funciones, clases',
      'Extrae metadata de componentes',
      'Manejo de errores de sintaxis',
      'Soporta TypeScript',
      'Tests de parsing'
    ],
    userStory: {
      who: 'Developer',
      what: 'parsear el código a AST',
      why: 'poder manipular y renombrar elementos'
    },
    bizPoints: 75,
    devPoints: 5
  },
  {
    title: '[AST-02] Renombrador de Clases CSS',
    acceptanceCriteria: [
      'Función renameClassNames(ast, mapping) → code',
      'Reemplaza todos los nombres de clases',
      'Mapping: "original" → "unique-hash"',
      'Preserva funcionalidad del CSS',
      'Manejo de selectors complejos',
      'Tests con diferentes CSS',
      'Performance acceptable'
    ],
    userStory: {
      who: 'Developer',
      what: 'renombrar clases CSS para evitar conflictos',
      why: 'que no colisionen con otros estilos'
    },
    bizPoints: 60,
    devPoints: 3
  },
  {
    title: '[AST-03] Renombrador de JSX ClassNames',
    acceptanceCriteria: [
      'Reemplaza className="original" → className="unique"',
      'Usa mismo mapping que renombrador de CSS',
      'Soporta template literals con className',
      'Preserva spread operators {...props}',
      'Tests con JSX complejo',
      'Integrable con renombrador de CSS',
      'No rompe funcionalidad'
    ],
    userStory: {
      who: 'Developer',
      what: 'renombrar clases en JSX para que coincidan',
      why: 'que los estilos se apliquen correctamente'
    },
    bizPoints: 55,
    devPoints: 3
  },
  {
    title: '[MKT-02] Lógica de Instalación (Clonación)',
    acceptanceCriteria: [
      'POST /api/projects/:id/install-component',
      'Recibe { sourceComponentId, targetProjectId }',
      'Renombra clases para evitar conflictos',
      'Agrega componente al árbol del proyecto',
      'Genera nuevo ID único para instancia',
      'Copia código y CSS al proyecto',
      'Retorna componente instalado'
    ],
    userStory: {
      who: 'User',
      what: 'instalar un componente del marketplace',
      why: 'reutilizar componentes en mis proyectos'
    },
    bizPoints: 80,
    devPoints: 4
  },
  {
    title: '[DB-06] Schema Prisma: Licencias',
    acceptanceCriteria: [
      'Modelo License con id, tenantId, status, expiresAt',
      'Modelo Subscription con licenseId, seatCount, status',
      'Modelo LicenseKey con key, status, subscription',
      'Relaciones: 1:N License > Subscription',
      'Validaciones: keys únicas, dates lógicas',
      'Historial de cambios (createdAt, updatedAt)',
      'Índices para búsquedas'
    ],
    userStory: {
      who: 'Admin',
      what: 'tener estructura para licencias',
      why: 'gestionar subscripciones de clientes'
    },
    bizPoints: 65,
    devPoints: 4
  },
  {
    title: '[ADM-01] Generador de Keys',
    acceptanceCriteria: [
      'Función generateLicenseKey() → string',
      'Genera key única de formato: XXXX-XXXX-XXXX-XXXX',
      'Usa caracteres alphanumerics (sin confusiones I/l/O/0)',
      'Storage seguro en base de datos',
      'No reutilizar keys',
      'Logging de generación',
      'Tests de unicidad'
    ],
    userStory: {
      who: 'Admin',
      what: 'generar claves de licencia para clientes',
      why: 'vender acceso de forma controlada'
    },
    bizPoints: 50,
    devPoints: 2
  },
  {
    title: '[BILL-01] API Activar Licencia',
    acceptanceCriteria: [
      'Endpoint POST /api/subscription/activate-license',
      'Recibe { tenantId, licenseKey }',
      'Busca LicenseKey por key',
      'Validar status = "pending"',
      'Crear Subscription con status "active"',
      'Actualizar LicenseKey.status = "active"',
      'Retorna { subscriptionId, seatCount, expiresAt }'
    ],
    userStory: {
      who: 'User',
      what: 'introducir mi clave de licencia',
      why: 'activar mi suscripción'
    },
    bizPoints: 60,
    devPoints: 3
  },
  {
    title: '[MID-02] Middleware Gatekeeper',
    acceptanceCriteria: [
      'Middleware verifica Subscription.status = "active"',
      'Si no existe subscription o status != "active"',
      'Redirigir a /payment-required',
      'Si expiración < hoy, tratarlo como inactivo',
      'Almacenar subscriptionId en request context',
      'No bloquear rutas de public/landing',
      'Performance < 50ms'
    ],
    userStory: {
      who: 'Developer',
      what: 'bloquear acceso a usuarios sin suscripción',
      why: 'proteger el modelo de negocio'
    },
    bizPoints: 65,
    devPoints: 3
  },
  {
    title: '[TEN-01] Gestión de Usuarios Finales',
    acceptanceCriteria: [
      'Modelo SiteUser con id, email, password, tenantId',
      'API POST /api/users crear SiteUser',
      'API GET /api/users listar usuarios del tenant',
      'API DELETE /api/users/:id borrar usuario',
      'Validar email único por tenant',
      'Hash de password con bcrypt',
      'Solo tenant owner puede gestionar usuarios'
    ],
    userStory: {
      who: 'User',
      what: 'crear usuarios en mi sitio web',
      why: 'tener visitantes con permisos diferentes'
    },
    bizPoints: 70,
    devPoints: 4
  },
  {
    title: '[TEN-02] Asignación de Seats',
    acceptanceCriteria: [
      'Al crear SiteUser, verificar seatCount disponibles',
      'Contar SiteUser activos del tenant',
      'Bloquear si count >= subscription.seatCount',
      'Mensaje claro: "Máximo X usuarios, tienes Y"',
      'Permitir desactivar usuarios para liberar seats',
      'El owner no cuenta en seatCount',
      'Update para cambiar seat asignments'
    ],
    userStory: {
      who: 'User',
      what: 'ver cuántos usuarios puedo crear',
      why: 'entender las limitaciones de mi plan'
    },
    bizPoints: 55,
    devPoints: 3
  },
  {
    title: '[DB-07] Tabla Flexible SiteData',
    acceptanceCriteria: [
      'Modelo SiteData con id, tenantId, key, value',
      'Columna value es JSON para flexibilidad',
      'Queries: by tenantId + key',
      'Upsert operations soportadas',
      'Índices para búsquedas rápidas',
      'TTL/expiración opcional',
      'Validación de tamaño máximo (1MB per key)'
    ],
    userStory: {
      who: 'Developer',
      what: 'almacenar datos flexibles del sitio',
      why: 'soportar cualquier estructura de datos'
    },
    bizPoints: 65,
    devPoints: 4
  },
  {
    title: '[RT-01] Hook useDatabase',
    acceptanceCriteria: [
      'Hook React: useDatabase(key, initialValue)',
      'Get/set SiteData en tiempo real',
      'Suscripción a cambios de otros usuarios',
      'Optimistic updates',
      'Error handling y retry',
      'Loading states',
      'Tests con React Testing Library'
    ],
    userStory: {
      who: 'Developer',
      what: 'acceder a datos de la base desde componentes',
      why: 'poder crear formularios que guardan datos'
    },
    bizPoints: 70,
    devPoints: 4
  },
  {
    title: '[API-02] Proxy de Datos',
    acceptanceCriteria: [
      'Endpoint GET /api/data/:key',
      'Endpoint POST /api/data/:key con body',
      'Validar tenantId desde request context',
      'Retorna SiteData filtrado por tenant',
      'Manejo de no encontrado (404)',
      'Caché con Vary header',
      'Rate limiting por tenant'
    ],
    userStory: {
      who: 'Developer',
      what: 'tener API para leer/escribir datos',
      why: 'que componentes runtime puedan acceder'
    },
    bizPoints: 65,
    devPoints: 4
  },
  {
    title: '[UI-02] Componente Formulario Conectado',
    acceptanceCriteria: [
      'Componente FormConnected en editor',
      'Interfaz para seleccionar Colección',
      'Interfaz para mapear campos',
      'Genera <form> HTML',
      'onSubmit guarda en SiteData via useDatabase',
      'Validaciones de campos',
      'Success message después de guardar'
    ],
    userStory: {
      who: 'User',
      what: 'crear formularios que guardan datos',
      why: 'recopilar información de visitantes'
    },
    bizPoints: 75,
    devPoints: 5
  },
  {
    title: '[AUTH-01] Login Component Runtime',
    acceptanceCriteria: [
      'Componente Login en editor',
      'Form con email y password',
      'onSubmit valida contra SiteUser',
      'Hash password matching con bcrypt',
      'Emite cookie de sesión (httpOnly, secure)',
      'Cookie válida solo para este subdominio',
      'Error si credenciales incorrectas'
    ],
    userStory: {
      who: 'User',
      what: 'crear login en mi sitio web',
      why: 'proteger áreas con acceso restringido'
    },
    bizPoints: 80,
    devPoints: 5
  }
];

async function main() {
  console.log('🚀 Iniciando creación REAL de tareas...\n');
  console.log(`📍 Proyecto: ${PROJECT_ID}`);
  console.log(`📋 Total de tareas a crear: ${TASKS.length}\n`);

  // Iniciar MCP server
  console.log('🔄 Iniciando MCP server...\n');
  const mcpProcess = spawn('npm', ['start'], {
    cwd: MCP_DIR,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let serverReady = false;
  let successCount = 0;
  let errorCount = 0;
  const failedTasks = [];

  // Detectar cuando el servidor está listo
  mcpProcess.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Planning Task MCP Server initialized')) {
      serverReady = true;
      console.log('✅ MCP Server ready!\n');
      sendTasks();
    }
  });

  mcpProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      try {
        const response = JSON.parse(output);
        if (response.result && response.result.id) {
          successCount++;
          const taskNum = successCount;
          if (taskNum <= TASKS.length) {
            process.stdout.write(
              `[${String(taskNum).padStart(2, '0')}/${TASKS.length}] ${TASKS[taskNum - 1].title}... ✅\n`
            );
          }
        }
      } catch (e) {
        // Ignorar respuestas que no sean JSON
      }
    }
  });

  mcpProcess.on('error', (error) => {
    console.error('❌ Error iniciando MCP:', error);
    process.exit(1);
  });

  async function sendTasks() {
    for (let i = 0; i < TASKS.length; i++) {
      const task = TASKS[i];

      const request = {
        jsonrpc: '2.0',
        id: i + 1,
        method: 'tools/call',
        params: {
          name: 'create_task',
          arguments: {
            title: task.title,
            projectId: PROJECT_ID,
            sprintId: Math.floor(i / 7) + '', // Sprint basado en posición
            acceptanceCriteria: task.acceptanceCriteria,
            userStory: task.userStory,
            developer: 'unassigned',
            startDate: new Date().toISOString(),
            bizPoints: task.bizPoints,
            devPoints: task.devPoints,
            status: 'to-do',
            createdBy: 'bulk-import-script'
          }
        }
      };

      mcpProcess.stdin.write(JSON.stringify(request) + '\n');
      await new Promise(resolve => setTimeout(resolve, 100)); // Evitar sobrecarga
    }

    // Esperar a que se completen los requests
    setTimeout(() => {
      console.log('\n' + '='.repeat(70));
      console.log(`✅ Exitosas: ${successCount}/${TASKS.length}`);
      console.log(`❌ Errores: ${errorCount}/${TASKS.length}`);
      console.log('='.repeat(70));
      mcpProcess.kill();
      process.exit(0);
    }, 5000);
  }
}

main().catch(console.error);
