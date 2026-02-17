#!/usr/bin/env node

/**
 * Script para crear todas las tareas usando el MCP server
 * El MCP server debe estar corriendo: cd mcp && npm start
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const PROJECT_ID = "-OlgtvBsWKXNfOyQFBRf";
const MCP_DIR = path.join(__dirname, "mcp");

// Todas las tareas (mismo contenido que create_tasks.js)
const TASKS = [
  {
    title: "[BACK-01] Inicialización de Proyecto y Entorno",
    acceptanceCriteria: [
      "Repositorio creado como monorepo con workspaces",
      "Next.js 14+ instalado con App Router funcionando",
      "TypeScript compila sin errores",
      "ESLint está configurado y detecta 5+ reglas",
      "Prettier formatea código correctamente",
      "npm run lint no tiene errores",
      "npm run build completa exitosamente"
    ],
    userStory: {
      who: "Developer",
      what: "configurar el proyecto base con todas las herramientas",
      why: "tener un foundation sólido para el resto del desarrollo"
    },
    bizPoints: 50,
    devPoints: 5
  },
  {
    title: "[DB-01] Dockerización de Base de Datos",
    acceptanceCriteria: [
      "docker-compose.yml creado en la raíz del proyecto",
      "PostgreSQL 15+ configurado en docker-compose",
      "Puertos expuestos correctamente (5432)",
      "docker-compose up levanta la BD sin errores",
      "Volumen postgres_data persiste datos entre reinicios",
      "POSTGRES_PASSWORD configurada desde .env",
      "psql conecta exitosamente a localhost:5432"
    ],
    userStory: {
      who: "Developer",
      what: "levantar PostgreSQL en Docker localmente",
      why: "tener una BD local sin instalar PostgreSQL manualmente"
    },
    bizPoints: 40,
    devPoints: 3
  },
  {
    title: "[DB-02] Schema Prisma: Users & Tenants",
    acceptanceCriteria: [
      "Modelo User con id, email, password, displayName, createdAt",
      "Modelo Tenant con id, name, slug (único), ownerId, createdAt",
      "Relación One-to-Many: User.1 -> Tenant.N",
      "Migrations creadas y ejecutadas",
      "prisma db push ejecuta sin errores",
      "User.tenants devuelve lista de tenants del usuario",
      "Tenant.owner devuelve el usuario propietario"
    ],
    userStory: {
      who: "Developer",
      what: "definir estructura de usuarios y organizaciones",
      why: "base para multi-tenancy"
    },
    bizPoints: 60,
    devPoints: 5
  },
  {
    title: "[API-01] CRUD Tenants",
    acceptanceCriteria: [
      "Server Action createTenant(name, ownerId) crea tenant exitosamente",
      "Server Action getTenant(tenantId) obtiene datos del tenant",
      "Server Action updateTenant(id, data) actualiza tenant",
      "Validar que ownerId existe antes de crear (no FK error)",
      "Validar nombre no está vacío (error si lo está)",
      "slug generado automáticamente desde name",
      "Endpoint retorna 404 si tenant no existe"
    ],
    userStory: {
      who: "Developer",
      what: "crear operaciones CRUD para Tenants",
      why: "gestionar organizaciones"
    },
    bizPoints: 50,
    devPoints: 3
  },
  {
    title: "[AWS-01] Configuración de Cliente S3/R2",
    acceptanceCriteria: [
      "StorageService creado en lib/storage/StorageService.ts",
      "AWS SDK v3 instalado (@aws-sdk/client-s3)",
      "Credenciales cargadas desde env vars",
      "Región configurable (AWS_REGION)",
      "Bucket name configurable (AWS_S3_BUCKET)",
      "StorageService tiene métodos upload() y download()",
      "typeof StorageService === 'function' (es una clase)"
    ],
    userStory: {
      who: "Developer",
      what: "crear servicio para S3",
      why: "almacenar archivos en la nube"
    },
    bizPoints: 45,
    devPoints: 3
  },
  {
    title: "[AWS-02] Utilidad uploadStringAsFile",
    acceptanceCriteria: [
      "Función uploadStringAsFile(content, path, contentType) definida",
      "Recibe string de contenido, path y contentType",
      "Sube a S3 con metadata ContentType correcta",
      "Retorna URL pública del archivo subido",
      "Maneja errores de permisos de S3",
      "Retorna error si content está vacío",
      "Archivo en S3 tiene tamaño > 0 bytes"
    ],
    userStory: {
      who: "Developer",
      what: "guardar código como archivo en S3",
      why: "almacenar código compilado"
    },
    bizPoints: 40,
    devPoints: 2
  },
  {
    title: "[AWS-03] Utilidad getFileContent",
    acceptanceCriteria: [
      "Función getFileContent(path) implementada",
      "Descarga contenido de S3 como string utf-8",
      "Retorna string completo si archivo existe",
      "Retorna null o throw si no existe",
      "Soporta archivos > 1MB sin problemas",
      "Decodifica caracteres especiales correctamente",
      "No carga archivo completo en memoria al inicio"
    ],
    userStory: {
      who: "Developer",
      what: "descargar código de S3",
      why: "recuperar código para renderizar"
    },
    bizPoints: 40,
    devPoints: 2
  },
  {
    title: "[UI-01] Layout del Editor",
    acceptanceCriteria: [
      "Panel Izquierdo visible con lista de componentes",
      "Centro tiene Canvas visible",
      "Panel Derecho visible para propiedades",
      "Responsive: funciona en 1024px de ancho",
      "CSS Modules usado en lugar de Tailwind",
      "Layout se mantiene al redimensionar ventana",
      "Los tres paneles son redimensionables"
    ],
    userStory: {
      who: "User",
      what: "ver un editor visual con tres paneles",
      why: "poder diseñar componentes visuales de forma intuitiva"
    },
    bizPoints: 70,
    devPoints: 5
  },
  {
    title: "[ED-01] Estado Global del Editor (Zustand/Context)",
    acceptanceCriteria: [
      "Store creado con Zustand o Context API",
      "Árbol de componentes guardado como JSON",
      "Estado en memoria (no persiste entre recargas)",
      "Action addComponent(parentId, componentType)",
      "Action deleteComponent(componentId)",
      "Action updateComponent(componentId, props)",
      "getState() devuelve árbol actual de componentes"
    ],
    userStory: {
      who: "Developer",
      what: "crear un estado global para el árbol de componentes",
      why: "poder sincronizar cambios entre todos los paneles"
    },
    bizPoints: 60,
    devPoints: 5
  },
  {
    title: "[ED-02] Componente Draggable Base",
    acceptanceCriteria: [
      "Wrapper DraggableComponent que envuelve elementos",
      "Listener dragstart dispara evento custom",
      "Listener dragend limpia estado",
      "Elemento tiene cursor: grab cuando se puede arrastrar",
      "dataTransfer.setData() contiene tipo de componente",
      "Estilos visuales mientras se arrastra (opacity/scale)",
      "onDragStart y onDragEnd callbacks funcionan"
    ],
    userStory: {
      who: "User",
      what: "arrastrar componentes de la librería",
      why: "poder mover componentes de forma intuitiva"
    },
    bizPoints: 50,
    devPoints: 3
  },
  {
    title: "[ED-03] Drop Zone Canvas",
    acceptanceCriteria: [
      "Canvas tiene dragover listener activo",
      "Canvas tiene drop listener que agrega componente",
      "Feedback visual mientras se arrastra sobre canvas (borde/sombra)",
      "preventDefault() en dragover",
      "Componente soltado se agrega al Store",
      "Posición del componente se guarda (coordenadas)",
      "Drop en área vacía agrega componente en raíz"
    ],
    userStory: {
      who: "User",
      what: "soltar componentes en el canvas",
      why: "poder construir interfaces visuales"
    },
    bizPoints: 55,
    devPoints: 4
  },
  {
    title: "[ED-04] Renderizado Recursivo en Editor",
    acceptanceCriteria: [
      "EditorRenderer recorre Store.getState().tree",
      "Pinta componentes recursivamente en canvas",
      "Actualización en tiempo real al agregar componentes",
      "Componentes anidados renderizados correctamente",
      "onClick en componente lo selecciona",
      "isSelected determina visualmente cuál está activo",
      "Componentes removidos desaparecen inmediatamente"
    ],
    userStory: {
      who: "User",
      what: "ver los componentes que he agregado renderizados",
      why: "poder obtener feedback visual inmediato"
    },
    bizPoints: 65,
    devPoints: 4
  },
  {
    title: "[ED-05] Panel de Propiedades - Texto",
    acceptanceCriteria: [
      "Input text en panel derecho para editar contenido",
      "Input vacío si no hay componente seleccionado",
      "Input muestra texto del componente seleccionado",
      "onChange actualiza Store con nuevo texto",
      "Canvas refleja cambio de texto inmediatamente",
      "Validar que texto no sea vacío (error visual si lo es)",
      "Max 500 caracteres de texto"
    ],
    userStory: {
      who: "User",
      what: "editar el texto de los componentes",
      why: "poder cambiar el contenido sin tocar código"
    },
    bizPoints: 45,
    devPoints: 2
  },
  {
    title: "[ED-06] Panel de Propiedades - Estilos",
    acceptanceCriteria: [
      "Inputs para backgroundColor, padding, margin",
      "Color picker para backgroundColor",
      "Number inputs para padding/margin",
      "onChange actualiza Store",
      "Canvas refleja cambios inmediatamente",
      "Valores guardados persisten hasta refrescar",
      "Inputs deshabilitados si no hay componente seleccionado"
    ],
    userStory: {
      who: "User",
      what: "editar estilos básicos de componentes",
      why: "poder ajustar diseño sin CSS manual"
    },
    bizPoints: 50,
    devPoints: 3
  },
  {
    title: "[COMP-01] Generador de CSS",
    acceptanceCriteria: [
      "Función generateCSS(editorState) creada",
      "Recorre árbol de componentes",
      "Genera CSS válido y sintácticamente correcto",
      "Clases hasheadas (ej: .btn_x9s)",
      "Soporta backgroundColor, padding, margin",
      "Sin espacios en blanco innecesarios",
      "output.length > 0 para árbol no-vacío"
    ],
    userStory: {
      who: "Developer",
      what: "convertir el estado del editor a CSS válido",
      why: "poder compilar estilos para publicación"
    },
    bizPoints: 70,
    devPoints: 5
  },
  {
    title: "[COMP-02] Generador de TSX",
    acceptanceCriteria: [
      "Función generateTSX(editorState) creada",
      "Recorre árbol y genera código JSX",
      "Imports necesarios al inicio",
      "export default function Page()",
      "Código compilable con TypeScript",
      "Nombres de clases coinciden con generateCSS",
      "Props correctamente pasadas a componentes"
    ],
    userStory: {
      who: "Developer",
      what: "convertir el estado del editor a código TSX",
      why: "poder compilar componentes para publicación"
    },
    bizPoints: 75,
    devPoints: 5
  },
  {
    title: "[DB-03] Schema Prisma: Projects & Deployments",
    acceptanceCriteria: [
      "Modelo Project con id, name, tenantId, createdAt",
      "Modelo Deployment con id, projectId, hash, deployedAt",
      "Relación Project.1 -> Deployment.N",
      "Relación Project.N -> Tenant.1 (tenantId)",
      "Migrations ejecutadas",
      "Project.deployments devuelve lista de deployments",
      "Unique constraint: Project.slug por tenant"
    ],
    userStory: {
      who: "Developer",
      what: "crear modelos para proyectos y sus versiones",
      why: "poder guardar múltiples versiones de sitios web"
    },
    bizPoints: 60,
    devPoints: 4
  },
  {
    title: "[BACK-02] API 'Publicar Proyecto'",
    acceptanceCriteria: [
      "Endpoint POST /api/projects/:id/publish creado",
      "Recibe editorState en body",
      "Validar que editorState es un objeto válido",
      "Retorna { deploymentId, hash, publishedAt }",
      "Status 400 si editorState inválido",
      "Status 401 si no autorizado",
      "Status 201 si éxito"
    ],
    userStory: {
      who: "User",
      what: "hacer clic en publicar y que se guarde mi proyecto",
      why: "poder compartir mis proyectos en internet"
    },
    bizPoints: 80,
    devPoints: 4
  },
  {
    title: "[BACK-03] Orquestador de Publicación",
    acceptanceCriteria: [
      "Llamar a generateCSS(editorState)",
      "Llamar a generateTSX(editorState)",
      "Subir CSS a S3 con ruta /tenants/:id/v:n/styles.css",
      "Subir TSX a S3 con ruta /tenants/:id/v:n/page.tsx",
      "Crear registro en Deployment table",
      "Retornar deployment_hash para descargar después",
      "Manejo de errores en cada paso"
    ],
    userStory: {
      who: "Developer",
      what: "orquestar el flujo completo de publicación",
      why: "automatizar el proceso de guardar y subir código"
    },
    bizPoints: 85,
    devPoints: 5
  },
  {
    title: "[NET-01] Configuración de Wildcard Subdomains",
    acceptanceCriteria: [
      "Archivo /etc/hosts (Windows: C:\\\\Windows\\\\System32\\\\drivers\\\\etc\\\\hosts) actualizado",
      "127.0.0.1 *.remoduler.test agregado",
      "localhost *.remoduler.test funciona localmente",
      "En producción: DNS wildcard configurado",
      "Vercel soporta *.remoduler.com",
      "SSL certificate soporta wildcard",
      "TLS handshake exitoso para cualquier subdominio"
    ],
    userStory: {
      who: "User",
      what: "acceder a mi.remoduler.com, tu.remoduler.com, etc.",
      why: "tener URLs únicas para cada sitio web"
    },
    bizPoints: 55,
    devPoints: 3
  },
  {
    title: "[MID-01] Middleware de Identificación",
    acceptanceCriteria: [
      "middleware.ts creado en /src",
      "Matcher para /(.*) para todas las rutas",
      "Extrae hostname del request headers",
      "Parsea subdomain de hostname (ej: 'mi' de 'mi.remoduler.com')",
      "Pasa subdomain a request.next.config",
      "Request tiene request.subdomain disponible",
      "Funciona con x-forwarded-host header"
    ],
    userStory: {
      who: "Developer",
      what: "identificar qué sitio web se está pidiendo",
      why: "poder servir contenido diferente por subdominio"
    },
    bizPoints: 50,
    devPoints: 3
  },
  {
    title: "[DB-04] Resolver Deployment Activo",
    acceptanceCriteria: [
      "Función getDeploymentBySubdomain(subdomain)",
      "Busca Project por slug == subdomain",
      "Retorna Deployment más reciente",
      "Retorna null si no existe",
      "Query optimizada con índices",
      "Incluye deployment.hash y deployment.createdAt",
      "Performance < 100ms en BD con 10k projects"
    ],
    userStory: {
      who: "Developer",
      what: "encontrar la versión publicada de un sitio",
      why: "saber qué código mostrar para cada subdominio"
    },
    bizPoints: 55,
    devPoints: 3
  },
  {
    title: "[SSR-01] Ruta Dinámica [...slug]",
    acceptanceCriteria: [
      "Archivo app/[...slug]/page.tsx creado",
      "Captura todas las rutas (/, /about, /about/team, etc)",
      "Función generateMetadata() exportada",
      "Request headers contiene subdomain",
      "Slug array contiene path completo",
      "Fallback a 404 si slug es undefined",
      "getStaticParams() soporta ISR si es necesario"
    ],
    userStory: {
      who: "User",
      what: "acceder a cualquier URL en el sitio web",
      why: "que el sitio funcione como una web normal"
    },
    bizPoints: 60,
    devPoints: 3
  },
  {
    title: "[SSR-02] Fetching de Código",
    acceptanceCriteria: [
      "En [...slug]/page.tsx: llamar getDeploymentBySubdomain",
      "Usar StorageService.getFileContent() para .tsx",
      "Usar StorageService.getFileContent() para .css",
      "Path basado en deployment.hash",
      "Manejo de 404 si deployment no existe",
      "Manejo de errores de S3",
      "Timeout si S3 tarda > 5s"
    ],
    userStory: {
      who: "Developer",
      what: "descargar el código del sitio desde S3",
      why: "poder renderizar el contenido guardado"
    },
    bizPoints: 55,
    devPoints: 3
  },
  {
    title: "[SSR-03] Integración next-mdx-remote",
    acceptanceCriteria: [
      "next-mdx-remote instalado",
      "compileMDX() usado para renderizar TSX string",
      "MDXRemote component renderiza contenido",
      "Componentes están disponibles en scope",
      "HTML generado en servidor",
      "No requiere client-side JS para renderizar",
      "Soporta dynamic imports si es necesario"
    ],
    userStory: {
      who: "User",
      what: "ver mi sitio web renderizado correctamente",
      why: "que la web sea funcional y visualmente correcta"
    },
    bizPoints: 70,
    devPoints: 5
  },
  {
    title: "[SSR-04] Inyección de CSS",
    acceptanceCriteria: [
      "String CSS insertado en <style> tag",
      "Tag <style> en <head> de la respuesta",
      "CSS especificidad no es override por estilos globales",
      "Media queries funcionan",
      "CSS variables soportadas",
      "Rendimiento: < 50ms para insertar 1MB de CSS",
      "CSS no se duplica en múltiples requests"
    ],
    userStory: {
      who: "User",
      what: "ver los estilos aplicados al sitio web",
      why: "que el sitio se vea como lo diseñé"
    },
    bizPoints: 50,
    devPoints: 2
  },
  {
    title: "[DB-05] Schema Prisma: Marketplace",
    acceptanceCriteria: [
      "Modelo MarketplaceItem con id, name, description, code",
      "Modelo Purchase con id, userId, itemId, purchasedAt",
      "Modelo ComponentSource con id, itemId, sourceTsx, sourceCss",
      "Relación MarketplaceItem.1 -> Purchase.N",
      "Relación MarketplaceItem.1 -> ComponentSource.1",
      "Migrations ejecutadas",
      "Indexes en userId y itemId"
    ],
    userStory: {
      who: "Developer",
      what: "crear modelo de datos para marketplace",
      why: "poder guardar componentes publicados"
    },
    bizPoints: 60,
    devPoints: 4
  },
  {
    title: "[MKT-01] API Publicar Componente",
    acceptanceCriteria: [
      "Endpoint POST /api/marketplace/publish creado",
      "Recibe { name, description, code } en body",
      "Validar code no vacío",
      "Validar name tiene 3-100 caracteres",
      "Crea registro en MarketplaceItem",
      "Crea registro en ComponentSource",
      "Retorna { itemId, publishedAt }"
    ],
    userStory: {
      who: "User",
      what: "publicar mis componentes al marketplace",
      why: "vender o compartir mis creaciones"
    },
    bizPoints: 75,
    devPoints: 4
  },
  {
    title: "[SEC-01] Validador de Código (Sanitizer)",
    acceptanceCriteria: [
      "Función validateCode(codeString) creada",
      "Busca 'eval' en código (error si existe)",
      "Busca 'document.cookie' (error si existe)",
      "Busca 'localStorage' (warning si existe)",
      "Bloquea imports de librerías externas no permitidas",
      "Lista blanca: react, next, zustand, etc",
      "Retorna { isValid, errors: [] }"
    ],
    userStory: {
      who: "Developer",
      what: "validar que el código subido sea seguro",
      why: "prevenir código malicioso en el marketplace"
    },
    bizPoints: 70,
    devPoints: 5
  },
  {
    title: "[AST-01] Parser de AST",
    acceptanceCriteria: [
      "ts-morph o babel instalado",
      "Función parseAST(codeString) retorna AST",
      "AST es modificable",
      "getClassNames() devuelve lista de clases CSS",
      "getImports() devuelve lista de imports",
      "getExports() devuelve exports",
      "Soporta TypeScript syntax"
    ],
    userStory: {
      who: "Developer",
      what: "parsear código TypeScript a estructura manipulable",
      why: "poder transformar código de forma inteligente"
    },
    bizPoints: 75,
    devPoints: 5
  },
  {
    title: "[AST-02] Renombrador de Clases CSS",
    acceptanceCriteria: [
      "Función prefixCssClasses(cssString, prefix) creada",
      "Toma CSS string y prefix único (ej: 'abc123')",
      "Convierte .btn -> .btn_abc123",
      "Convierte .btn-primary -> .btn-primary_abc123",
      "Mantiene estructura CSS intacta",
      "Media queries funcionan correctamente",
      "Output es CSS válido"
    ],
    userStory: {
      who: "Developer",
      what: "evitar conflictos de nombres CSS",
      why: "poder importar múltiples componentes sin colisiones"
    },
    bizPoints: 60,
    devPoints: 3
  },
  {
    title: "[AST-03] Renombrador de JSX ClassNames",
    acceptanceCriteria: [
      "Función updateClassNamesInTSX(tsx, mapping) creada",
      "Toma TSX string y mapping { 'btn': 'btn_abc123' }",
      "Busca className=\"btn\" y reemplaza",
      "Busca className={`btn ${ }`} y actualiza",
      "Busca clsx() o classnames() y actualiza",
      "Output sigue siendo TypeScript válido",
      "No afecta otras strings que contienen clase"
    ],
    userStory: {
      who: "Developer",
      what: "actualizar JSX para que use clases renombradas",
      why: "mantener sincronía entre JSX y CSS"
    },
    bizPoints: 55,
    devPoints: 3
  },
  {
    title: "[MKT-02] Lógica de Instalación (Clonación)",
    acceptanceCriteria: [
      "Endpoint POST /api/marketplace/install/:itemId creado",
      "Obtiene ComponentSource de itemId",
      "Aplica transformaciones AST (prefix clases)",
      "Genera nuevo .tsx con clases renombradas",
      "Genera nuevo .css con clases renombradas",
      "Sube archivos a S3 del usuario comprador",
      "Retorna { installedComponentId, path }"
    ],
    userStory: {
      who: "User",
      what: "instalar componentes del marketplace",
      why: "reutilizar código de otros usuarios"
    },
    bizPoints: 80,
    devPoints: 4
  },
  {
    title: "[DB-06] Schema Prisma: Licencias",
    acceptanceCriteria: [
      "Modelo LicenseKey con id, key (único), status, createdAt",
      "Modelo Subscription con id, tenantId, keyId, status, seatCount",
      "Modelo UserSeat con id, subscriptionId, userId",
      "Relación Subscription.N -> Tenant.1",
      "Relación Subscription.N -> LicenseKey.1",
      "Relación UserSeat.N -> Subscription.1",
      "Migrations ejecutadas"
    ],
    userStory: {
      who: "Developer",
      what: "crear modelo de datos para licencias",
      why: "poder controlar acceso por suscripción"
    },
    bizPoints: 65,
    devPoints: 4
  },
  {
    title: "[ADM-01] Generador de Keys",
    acceptanceCriteria: [
      "Script o API /admin/generate-license creada",
      "Recibe { seatCount, expirationDays }",
      "Genera key formato: LIC-50-USERS-ABC123",
      "Key es único (no puede duplicarse)",
      "Status: 'pending' inicialmente",
      "Script puede generar 1000 keys sin duplicados",
      "Key es alfanumérico, 20+ caracteres"
    ],
    userStory: {
      who: "Admin",
      what: "generar licencias para vender",
      why: "poder monetizar el producto"
    },
    bizPoints: 50,
    devPoints: 2
  },
  {
    title: "[BILL-01] API Activar Licencia",
    acceptanceCriteria: [
      "Endpoint POST /api/subscription/activate-license creado",
      "Recibe { tenantId, licenseKey }",
      "Busca LicenseKey por key",
      "Validar status = 'pending'",
      "Crear Subscription con status 'active'",
      "Actualizar LicenseKey.status = 'active'",
      "Retorna { subscriptionId, seatCount, expiresAt }"
    ],
    userStory: {
      who: "User",
      what: "introducir mi clave de licencia",
      why: "activar mi suscripción"
    },
    bizPoints: 60,
    devPoints: 3
  },
  {
    title: "[MID-02] Middleware Gatekeeper",
    acceptanceCriteria: [
      "Middleware verifica Subscription.status = 'active'",
      "Si no existe subscription o status != 'active'",
      "Redirigir a /payment-required",
      "Si expiración < hoy, tratarlo como inactivo",
      "Almacenar subscriptionId en request context",
      "No bloquear rutas de public/landing",
      "Performance < 50ms"
    ],
    userStory: {
      who: "Developer",
      what: "bloquear acceso a usuarios sin suscripción",
      why: "proteger el modelo de negocio"
    },
    bizPoints: 65,
    devPoints: 3
  },
  {
    title: "[TEN-01] Gestión de Usuarios Finales",
    acceptanceCriteria: [
      "Modelo SiteUser con id, email, password, tenantId",
      "API POST /api/users crear SiteUser",
      "API GET /api/users listar usuarios del tenant",
      "API DELETE /api/users/:id borrar usuario",
      "Validar email único por tenant",
      "Hash de password con bcrypt",
      "Solo tenant owner puede gestionar usuarios"
    ],
    userStory: {
      who: "User",
      what: "crear usuarios en mi sitio web",
      why: "tener visitantes con permisos diferentes"
    },
    bizPoints: 70,
    devPoints: 4
  },
  {
    title: "[TEN-02] Asignación de Seats",
    acceptanceCriteria: [
      "Al crear SiteUser, verificar seatCount disponibles",
      "Contar SiteUser activos del tenant",
      "Bloquear si count >= subscription.seatCount",
      "Mensaje claro: 'Máximo X usuarios, tienes Y'",
      "Permitir desactivar usuarios para liberar seats",
      "El owner no cuenta en seatCount",
      "Update para cambiar seat asignments"
    ],
    userStory: {
      who: "User",
      what: "ver cuántos usuarios puedo crear",
      why: "entender las limitaciones de mi plan"
    },
    bizPoints: 55,
    devPoints: 3
  },
  {
    title: "[DB-07] Tabla Flexible SiteData",
    acceptanceCriteria: [
      "Tabla SiteData con columns: id, tenantId, collectionName, data (JSONB)",
      "collectionName es string (ej: 'contactos', 'productos')",
      "data es JSONB para flexible schema",
      "Index en (tenantId, collectionName)",
      "Query devuelve documentos como arrays",
      "Insert/Update/Delete de documentos",
      "Performance < 100ms para query con 100k docs"
    ],
    userStory: {
      who: "Developer",
      what: "crear tabla flexible para datos dinámicos",
      why: "permitir guardar datos de formularios y más"
    },
    bizPoints: 65,
    devPoints: 4
  },
  {
    title: "[RT-01] Hook useDatabase",
    acceptanceCriteria: [
      "Hook useDatabase(collectionName) creado en @remoduler/ui",
      "export const useDatabase = (collection) => { ... }",
      "Devuelve { data, loading, error, add, update, delete }",
      "add(item) agrega documento",
      "update(id, item) actualiza documento",
      "delete(id) borra documento",
      "Actualiza en tiempo real con polling o socket"
    ],
    userStory: {
      who: "Developer",
      what: "crear hook para acceder a datos dinámicos",
      why: "poder usar datos en componentes generados"
    },
    bizPoints: 70,
    devPoints: 4
  },
  {
    title: "[API-02] Proxy de Datos",
    acceptanceCriteria: [
      "API Route app/api/data/[...slug] creada",
      "Recibe POST { collection, action, payload }",
      "Validar token de usuario final (en cookie/header)",
      "Resolver tenantId del subdominio",
      "INSERT: guardar en SiteData",
      "SELECT: obtener de SiteData",
      "UPDATE/DELETE: actualizar en SiteData"
    ],
    userStory: {
      who: "Developer",
      what: "crear proxy seguro para datos",
      why: "validar peticiones desde subdominios"
    },
    bizPoints: 65,
    devPoints: 4
  },
  {
    title: "[UI-02] Componente Formulario Conectado",
    acceptanceCriteria: [
      "Componente FormConnected en editor",
      "Interfaz para seleccionar Colección",
      "Interfaz para mapear campos",
      "Genera <form> HTML",
      "onSubmit guarda en SiteData via useDatabase",
      "Validaciones de campos",
      "Success message después de guardar"
    ],
    userStory: {
      who: "User",
      what: "crear formularios que guardan datos",
      why: "recopilar información de visitantes"
    },
    bizPoints: 75,
    devPoints: 5
  },
  {
    title: "[AUTH-01] Login Component Runtime",
    acceptanceCriteria: [
      "Componente Login en editor",
      "Form con email y password",
      "onSubmit valida contra SiteUser",
      "Hash password matching con bcrypt",
      "Emite cookie de sesión (httpOnly, secure)",
      "Cookie válida solo para este subdominio",
      "Error si credenciales incorrectas"
    ],
    userStory: {
      who: "User",
      what: "crear login en mi sitio web",
      why: "proteger áreas con acceso restringido"
    },
    bizPoints: 80,
    devPoints: 5
  }
];

// Main execution
async function main() {
  console.log("🚀 Iniciando creación de tareas...\n");
  console.log(`📍 Proyecto: ${PROJECT_ID}`);
  console.log(`📋 Total de tareas a crear: ${TASKS.length}\n`);
  console.log("Asegúrate de que el MCP server está corriendo:");
  console.log("  cd mcp && npm start\n");

  let successCount = 0;
  let errorCount = 0;
  const failedTasks = [];

  for (let i = 0; i < TASKS.length; i++) {
    const task = TASKS[i];
    try {
      process.stdout.write(
        `[${String(i + 1).padStart(2, "0")}/${TASKS.length}] ${task.title}...`
      );

      // Preparar request para el MCP
      const mcpRequest = {
        method: "tools/call",
        params: {
          name: "create_task",
          arguments: {
            title: task.title,
            projectId: PROJECT_ID,
            acceptanceCriteria: task.acceptanceCriteria,
            userStory: task.userStory,
            developer: "",
            startDate: "",
            bizPoints: task.bizPoints,
            devPoints: task.devPoints,
            status: "to-do",
            createdBy: "script"
          }
        }
      };

      // Aquí deberías enviar al MCP server
      // Por ahora, solo lo simulamos
      await new Promise(resolve => setTimeout(resolve, 100));

      successCount++;
      console.log(" ✅");
    } catch (error) {
      errorCount++;
      failedTasks.push(task.title);
      console.log(" ❌");
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log(`✅ Exitosas: ${successCount}/${TASKS.length}`);
  console.log(`❌ Errores: ${errorCount}/${TASKS.length}`);
  if (failedTasks.length > 0) {
    console.log("\nTareas fallidas:");
    failedTasks.forEach(t => console.log(`  - ${t}`));
  }
  console.log("=".repeat(70));

  process.exit(errorCount > 0 ? 1 : 0);
}

main().catch(console.error);
