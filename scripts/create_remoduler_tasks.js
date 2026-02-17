#!/usr/bin/env node

// Generate structured data for Remoduler project tasks
// This script creates all sprints, tasks, and acceptance criteria

const sprintsData = [
  {
    name: '🏗️ Sprint 0: Infraestructura y Modelado de Datos',
    description: 'Los Cimientos - Tener la base de datos lista y la conexión con AWS S3 funcionando',
    duration: '3 semanas',
    tasks: [
      {
        code: 'BACK-01',
        title: 'Inicialización de Proyecto y Entorno',
        description: 'Configurar repositorio Monorepo, instalar Next.js 14+ (App Router), TypeScript, ESLint y Prettier con reglas estrictas.',
        acceptanceCriteria: [
          'Repositorio Monorepo configurado correctamente',
          'Next.js 14+ instalado con App Router activo',
          'TypeScript funcional en toda la app',
          'ESLint con configuración strict aplicada',
          'Prettier configurado y ejecutándose en pre-commit',
          'Todos los linters pasan sin errores'
        ]
      },
      {
        code: 'DB-01',
        title: 'Dockerización de Base de Datos',
        description: 'Crear docker-compose.yml para levantar PostgreSQL localmente para desarrollo.',
        acceptanceCriteria: [
          'docker-compose.yml creado y funcional',
          'PostgreSQL levanta con docker-compose up',
          'Volumen persistente configurado',
          'Script de inicialización de BD disponible',
          'Documentación sobre cómo usar postgres en local'
        ]
      },
      {
        code: 'DB-02',
        title: 'Schema Prisma: Users & Tenants',
        description: 'Definir modelos User (dueño de la cuenta) y Tenant (Organización). Relación 1:N.',
        acceptanceCriteria: [
          'Modelo User creado en schema.prisma',
          'Modelo Tenant creado en schema.prisma',
          'Relación 1:N User-Tenant establecida',
          'Migraciones de Prisma ejecutadas',
          'Seeds iniciales funcionando'
        ]
      },
      {
        code: 'API-01',
        title: 'CRUD Tenants',
        description: 'Crear Server Actions para crear, leer y actualizar la información básica de un Tenant.',
        acceptanceCriteria: [
          'Server Action Create Tenant implementada',
          'Server Action Read Tenant implementada',
          'Server Action Update Tenant implementada',
          'Validaciones en todos los endpoints',
          'Pruebas unitarias para CRUD operations'
        ]
      },
      {
        code: 'AWS-01',
        title: 'Configuración de Cliente S3/R2',
        description: 'Implementar clase StorageService en /lib que instancie el cliente AWS SDK.',
        acceptanceCriteria: [
          'StorageService clase creada',
          'AWS SDK configurado correctamente',
          'Credenciales gestionadas via .env',
          'Métodos básicos init/authenticate trabajando',
          'Pruebas de conexión pasando'
        ]
      },
      {
        code: 'AWS-02',
        title: 'Utilidad uploadStringAsFile',
        description: 'Crear función que reciba un string (código), un path, y lo suba a S3 con ContentType: text/plain o application/javascript.',
        acceptanceCriteria: [
          'Función uploadStringAsFile implementada',
          'ContentType aplicado correctamente',
          'Errores manejados apropiadamente',
          'Función testeada con strings reales',
          'Archivos se crean en S3 correctamente'
        ]
      },
      {
        code: 'AWS-03',
        title: 'Utilidad getFileContent',
        description: 'Crear función que reciba un path y descargue el contenido del archivo como string utf-8.',
        acceptanceCriteria: [
          'Función getFileContent implementada',
          'Encoding UTF-8 aplicado',
          'Manejo de errores (404, etc)',
          'Función testeada con archivos reales',
          'Descargas funcionan correctamente'
        ]
      }
    ]
  },
  {
    name: '🎨 Sprint 1: El Editor Visual (Core Frontend)',
    description: 'El usuario puede ver un lienzo, arrastrar una caja y el sistema sabe qué pasó',
    duration: '3 semanas',
    tasks: [
      {
        code: 'UI-01',
        title: 'Layout del Editor',
        description: 'Crear estructura visual con Panel Izquierdo (Componentes), Centro (Canvas), Panel Derecho (Propiedades). CSS Modules puro.',
        acceptanceCriteria: [
          'Layout 3-paneles implementado',
          'Panel izquierdo muestra lista de componentes',
          'Canvas central es draggable',
          'Panel derecho para propiedades',
          'Diseño responsive en tablets',
          'CSS Modules usado (sin Tailwind)'
        ]
      },
      {
        code: 'ED-01',
        title: 'Estado Global del Editor (Zustand/Context)',
        description: 'Definir store para guardar el árbol de componentes actual (JSON temporal en memoria).',
        acceptanceCriteria: [
          'Store de estado creado (Zustand)',
          'Árbol de componentes representa correctamente',
          'Acciones para agregar/remover componentes',
          'Acciones para actualizar propiedades',
          'Serialización JSON funcional'
        ]
      },
      {
        code: 'ED-02',
        title: 'Componente Draggable Base',
        description: 'Crear un wrapper que haga que cualquier elemento HTML sea arrastrable hacia el canvas.',
        acceptanceCriteria: [
          'Componente DraggableWrapper creado',
          'Drag & Drop funciona en navegadores modernos',
          'Efectos visuales durante drag',
          'Cursor cambia apropiadamente',
          'No hay lag durante drag'
        ]
      },
      {
        code: 'ED-03',
        title: 'Drop Zone Canvas',
        description: 'Implementar lógica para detectar cuándo se suelta un componente en el canvas y añadirlo al Store.',
        acceptanceCriteria: [
          'Drop zone acepta elementos draggables',
          'Componentes se agregan al store on drop',
          'Posición del drop se registra',
          'Feedback visual de zona válida',
          'No se pueden soltar fuera de canvas'
        ]
      },
      {
        code: 'ED-04',
        title: 'Renderizado Recursivo en Editor',
        description: 'Crear componente EditorRenderer que recorra el Store y pinte los componentes en el canvas visualmente.',
        acceptanceCriteria: [
          'EditorRenderer componente implementado',
          'Renderizado recursivo funciona',
          'Componentes mostrados en tiempo real',
          'Jerarquía visual correcta',
          'Sin memory leaks'
        ]
      },
      {
        code: 'ED-05',
        title: 'Panel de Propiedades - Texto',
        description: 'Crear input en panel derecho que, al seleccionar un componente, actualice su propiedad text o content en el Store.',
        acceptanceCriteria: [
          'Input de texto en panel derecho',
          'Actualización de store on input',
          'Cambios reflejados en canvas en tiempo real',
          'Validaciones de texto',
          'Máximo de caracteres implementado'
        ]
      },
      {
        code: 'ED-06',
        title: 'Panel de Propiedades - Estilos',
        description: 'Crear inputs para editar backgroundColor, padding y margin y actualizar el Store.',
        acceptanceCriteria: [
          'Color picker para backgroundColor',
          'Inputs numéricos para padding',
          'Inputs numéricos para margin',
          'Cambios aplicados en tiempo real',
          'Unidades correctas (px, rem, %)',
          'Valores válidos validados'
        ]
      }
    ]
  },
  {
    name: '⚙️ Sprint 2: El Compilador (De Visual a Código)',
    description: 'Convertir el estado del editor en archivos reales .tsx y .css',
    duration: '3 semanas',
    tasks: [
      {
        code: 'COMP-01',
        title: 'Generador de CSS',
        description: 'Crear función generateCSS(editorState) que recorra el árbol y genere un string CSS válido con nombres de clases hasheados',
        acceptanceCriteria: [
          'Función generateCSS implementada',
          'CSS válido generado',
          'Clases hasheadas (ej: .btn_x9s)',
          'Propiedades CSS aplicadas correctamente',
          'Sin duplicados en CSS'
        ]
      },
      {
        code: 'COMP-02',
        title: 'Generador de TSX',
        description: 'Crear función generateTSX(editorState) que recorra el árbol y genere un string con imports y JSX.',
        acceptanceCriteria: [
          'Función generateTSX implementada',
          'JSX válido generado',
          'Imports necesarios incluidos',
          'Props pasadas correctamente',
          'Syntax de TypeScript válida'
        ]
      },
      {
        code: 'DB-03',
        title: 'Schema Prisma: Projects & Deployments',
        description: 'Añadir tablas Project (sitio web) y Deployment (versión inmutable).',
        acceptanceCriteria: [
          'Modelo Project creado',
          'Modelo Deployment creado',
          'Relaciones apropiadas establecidas',
          'Migraciones ejecutadas',
          'Índices para queries rápidas'
        ]
      },
      {
        code: 'BACK-02',
        title: 'API Publicar Proyecto',
        description: 'Endpoint que recibe el estado del editor.',
        acceptanceCriteria: [
          'POST /api/projects/publish creado',
          'Validaciones de datos en entrada',
          'Manejo de errores',
          'Autenticación verificada',
          'Rate limiting implementado'
        ]
      },
      {
        code: 'BACK-03',
        title: 'Orquestador de Publicación',
        description: 'Lógica que llama a generateCSS, generateTSX, sube a S3 y crea registro en Deployment.',
        acceptanceCriteria: [
          'Orquestador implementado',
          'Llamadas a generateCSS y generateTSX',
          'Upload a S3 funcional',
          'Registro en BD creado',
          'Manejo de errores transaccional'
        ]
      }
    ]
  },
  {
    name: '🚀 Sprint 3: El Motor de Renderizado (SSR Remoto)',
    description: 'cliente.remoduler.com muestra la web generada',
    duration: '3 semanas',
    tasks: [
      {
        code: 'NET-01',
        title: 'Configuración de Wildcard Subdomains',
        description: 'Configurar DNS para aceptar *.remoduler.com',
        acceptanceCriteria: [
          'DNS configurado para wildcard',
          'Certificado SSL para *.remoduler.com',
          'Todos los subdominos resuelven correctamente',
          'No hay advertencias de HTTPS',
          'Propagación de DNS verificada'
        ]
      },
      {
        code: 'MID-01',
        title: 'Middleware de Identificación',
        description: 'Crear middleware.ts que lea el host del request y extraiga el subdominio.',
        acceptanceCriteria: [
          'Middleware implementado',
          'Extracción de subdominio funciona',
          'Fallback para localhost',
          'Manejo de puertos dinámicos',
          'Tests unitarios pasando'
        ]
      },
      {
        code: 'DB-04',
        title: 'Resolver Deployment Activo',
        description: 'Función que dado un subdominio, devuelva el deployment_hash activo',
        acceptanceCriteria: [
          'Función implementada',
          'Queries optimizadas a BD',
          'Caché implementado',
          'Manejo de 404 si no existe',
          'Performance: < 50ms query time'
        ]
      },
      {
        code: 'SSR-01',
        title: 'Ruta Dinámica [...slug]',
        description: 'Crear la página que capturará todas las rutas de los subdominios.',
        acceptanceCriteria: [
          'Ruta [...slug] creada',
          'Parámetro slug extraído correctamente',
          'Fallback a index si slug vacío',
          'Generación estática posible',
          'Revalidación on-demand configurada'
        ]
      },
      {
        code: 'SSR-02',
        title: 'Fetching de Código',
        description: 'En la ruta dinámica, usar StorageService para bajar .tsx y .css de S3',
        acceptanceCriteria: [
          'Código TSX descargado de S3',
          'CSS descargado de S3',
          'Caching implementado',
          'Errores de 404 manejados',
          'Timeout implementado'
        ]
      },
      {
        code: 'SSR-03',
        title: 'Integración next-mdx-remote',
        description: 'Implementar motor que toma el string TSX descargado y lo renderiza como HTML',
        acceptanceCriteria: [
          'next-mdx-remote integrado',
          'Componentes custom registrados',
          'Scope seguro implementado',
          'Sin code injection posible',
          'Performance > 90 Lighthouse'
        ]
      },
      {
        code: 'SSR-04',
        title: 'Inyección de CSS',
        description: 'Asegurar que el string CSS descargado se inyecte en un tag <style> en el head',
        acceptanceCriteria: [
          'CSS inyectado correctamente',
          'Estilos aplicados en SSR',
          'No hay FOUC (Flash of Unstyled Content)',
          'CSS minimizado',
          'No hay style conflicts'
        ]
      }
    ]
  },
  {
    name: '📦 Sprint 4: Marketplace y Aislamiento (Marketplace Core)',
    description: 'Permitir subir componentes y descargarlos sin romper nada',
    duration: '3 semanas',
    tasks: [
      {
        code: 'DB-05',
        title: 'Schema Prisma: Marketplace',
        description: 'Tablas MarketplaceItem, Purchase, ComponentSource',
        acceptanceCriteria: [
          'Modelo MarketplaceItem creado',
          'Modelo Purchase creado',
          'Modelo ComponentSource creado',
          'Relaciones establecidas',
          'Migraciones ejecutadas'
        ]
      },
      {
        code: 'MKT-01',
        title: 'API Publicar Componente',
        description: 'Endpoint que permite a un usuario subir un trozo de código al Marketplace',
        acceptanceCriteria: [
          'POST /api/marketplace/publish creado',
          'Validación de código implementada',
          'Almacenamiento en BD',
          'Upload a S3 funcional',
          'Autenticación requerida'
        ]
      },
      {
        code: 'SEC-01',
        title: 'Validador de Código (Sanitizer)',
        description: 'Función que escanea el string buscando patrones prohibidos',
        acceptanceCriteria: [
          'Detector de eval implementado',
          'Detector de document.cookie implementado',
          'Detector de imports externos prohibidos',
          'Whitelist de imports permitidos',
          'Tests de seguridad pasando'
        ]
      },
      {
        code: 'AST-01',
        title: 'Parser de AST (Abstract Syntax Tree)',
        description: 'Implementar utilidad para leer código TypeScript y convertirlo en árbol manipulable',
        acceptanceCriteria: [
          'Parser AST implementado',
          'Soporta TypeScript/JSX',
          'Árbol navegable correctamente',
          'Performance aceptable',
          'Tests con código real pasando'
        ]
      },
      {
        code: 'AST-02',
        title: 'Renombrador de Clases CSS',
        description: 'Función que prefija todas las clases CSS con un ID único',
        acceptanceCriteria: [
          'Función implementada',
          'Prefijos únicos generados',
          'Todas las clases encontradas',
          'Sin falsos positivos',
          'Performance en archivos grandes'
        ]
      },
      {
        code: 'AST-03',
        title: 'Renombrador de JSX ClassNames',
        description: 'Función que hace lo mismo en archivo .tsx',
        acceptanceCriteria: [
          'Función implementada',
          'Coincidencia con CSS renombrado',
          'Template strings soportados',
          'Condicionales soportadas',
          'Sin romper JSX'
        ]
      },
      {
        code: 'MKT-02',
        title: 'Lógica de Instalación (Clonación)',
        description: 'Endpoint que ejecuta transformaciones AST y guarda archivos en S3',
        acceptanceCriteria: [
          'POST /api/marketplace/install creado',
          'AST transformations ejecutadas',
          'Archivos guardados en S3 correcto',
          'Registro en BD actualizado',
          'Manejo de errores robusto'
        ]
      }
    ]
  },
  {
    name: '💳 Sprint 5: Licencias y Negocio',
    description: 'Sistema de control de acceso - Sin esto no cobras',
    duration: '3 semanas',
    tasks: [
      {
        code: 'DB-06',
        title: 'Schema Prisma: Licencias',
        description: 'Tablas LicenseKey, Subscription, UserSeat',
        acceptanceCriteria: [
          'Modelo LicenseKey creado',
          'Modelo Subscription creado',
          'Modelo UserSeat creado',
          'Relaciones establecidas',
          'Índices para búsquedas rápidas'
        ]
      },
      {
        code: 'ADM-01',
        title: 'Generador de Keys',
        description: 'Script o API interna para generar strings de licencia',
        acceptanceCriteria: [
          'Generador de keys implementado',
          'Formato LIC-50-USERS válido',
          'Claves únicas garantizadas',
          'Almacenadas en BD',
          'Admin dashboard disponible'
        ]
      },
      {
        code: 'BILL-01',
        title: 'API Activar Licencia',
        description: 'Endpoint donde el Tenant introduce la Key y se crea su Subscription',
        acceptanceCriteria: [
          'POST /api/licenses/activate creado',
          'Validación de key',
          'Subscription creada',
          'Asientos asignados',
          'Email de confirmación enviado'
        ]
      },
      {
        code: 'MID-02',
        title: 'Middleware Gatekeeper',
        description: 'Verificar si el Tenant tiene suscripción activa, si no redirigir',
        acceptanceCriteria: [
          'Middleware implementado',
          'Verificación de suscripción activa',
          'Redirección a landing de pago',
          'Grace period implementado',
          'Renovación automática soportada'
        ]
      },
      {
        code: 'TEN-01',
        title: 'Gestión de Usuarios Finales',
        description: 'API para que el Tenant cree usuarios en su propia web',
        acceptanceCriteria: [
          'POST /api/site-users creado',
          'Validación de email',
          'Password hasheado',
          'Confirmación de email',
          'Rate limiting implementado'
        ]
      },
      {
        code: 'TEN-02',
        title: 'Asignación de Seats',
        description: 'Lógica que impide crear más usuarios que los permitidos',
        acceptanceCriteria: [
          'Contador de usuarios activos',
          'Validación contra límite de licencia',
          'Error message claro',
          'Opción de upgrade visible',
          'Notificación al admin'
        ]
      }
    ]
  },
  {
    name: '🔌 Sprint 6: Datos Dinámicos y Runtime',
    description: 'Hacer que las webs generadas sean funcionales',
    duration: '3 semanas',
    tasks: [
      {
        code: 'DB-07',
        title: 'Tabla Flexible SiteData',
        description: 'Tabla con tenant_id, collection_name y data (JSONB)',
        acceptanceCriteria: [
          'Modelo SiteData creado',
          'Columna JSONB para data',
          'Índices para búsquedas',
          'Validación de schema JSON',
          'Migraciones ejecutadas'
        ]
      },
      {
        code: 'RT-01',
        title: 'Hook useDatabase',
        description: 'Hook de React que permite fetch a API de datos',
        acceptanceCriteria: [
          'Hook useDatabase creado',
          'GET requests funcionales',
          'Caching local implementado',
          'Manejo de loading state',
          'Error handling robusto'
        ]
      },
      {
        code: 'API-02',
        title: 'Proxy de Datos',
        description: 'API Route que recibe peticiones desde subdominios y valida',
        acceptanceCriteria: [
          'POST /api/data creado',
          'Validación de token',
          'Guardado en SiteData',
          'CORS configurado',
          'Rate limiting implementado'
        ]
      },
      {
        code: 'UI-02',
        title: 'Componente Formulario Conectado',
        description: 'Componente que permite seleccionar una Colección',
        acceptanceCriteria: [
          'Componente Form creado',
          'Selector de colección',
          'Generación de campos automática',
          'Validación de formulario',
          'Envío a useDatabase'
        ]
      },
      {
        code: 'AUTH-01',
        title: 'Login Component Runtime',
        description: 'Componente de Login que valida contra SiteUser',
        acceptanceCriteria: [
          'Componente Login creado',
          'Validación contra BD',
          'Password verificado',
          'Cookie de sesión emitida',
          'Redirect después de login'
        ]
      }
    ]
  }
];

// Function to structure data for Firebase
function generateStructuredData() {
  const projectData = {
    sprints: [],
    tasks: [],
    sprintTaskMap: {}
  };

  sprintsData.forEach((sprintData, sprintIndex) => {
    const sprintId = `sprint_${sprintIndex}`;

    projectData.sprints.push({
      id: sprintId,
      name: sprintData.name,
      description: sprintData.description,
      duration: sprintData.duration,
      status: 'planned',
      createdAt: new Date().toISOString()
    });

    projectData.sprintTaskMap[sprintId] = [];

    sprintData.tasks.forEach((task, taskIndex) => {
      const taskId = `${task.code}_${taskIndex}`;

      projectData.tasks.push({
        id: taskId,
        code: task.code,
        title: task.title,
        description: task.description,
        sprintId: sprintId,
        status: 'todo',
        priority: 'medium',
        acceptanceCriteria: task.acceptanceCriteria,
        assignee: null,
        dueDate: null,
        createdAt: new Date().toISOString()
      });

      projectData.sprintTaskMap[sprintId].push(taskId);
    });
  });

  return projectData;
}

// Output the structured data
console.log(JSON.stringify(generateStructuredData(), null, 2));
