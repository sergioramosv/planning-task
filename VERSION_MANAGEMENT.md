# Sistema de Versionado Automático

Esta aplicación utiliza **Semantic Release** con **Conventional Commits** para un versionado automático y changelog generado automáticamente.

## ¿Cómo Funciona?

### 1. Formato de Commits (Conventional Commits)

Todos los commits deben seguir este formato:

```
<tipo>(<scope>): <descripción>

<cuerpo>

<pie>
```

#### Tipos válidos:

| Tipo | Descripción | Impacto en Versión | Ejemplo |
|------|-------------|-------------------|---------|
| `feat` | Nueva característica | MINOR ↑ | `feat: add dark mode` |
| `fix` | Corrección de bug | PATCH ↑ | `fix: resolve login issue` |
| `docs` | Cambios en documentación | (no incrementa) | `docs: update README` |
| `style` | Cambios de formato | (no incrementa) | `style: format code` |
| `refactor` | Refactorización sin cambio de funcionalidad | (no incrementa) | `refactor: simplify logic` |
| `perf` | Mejora de performance | PATCH ↑ | `perf: optimize queries` |
| `test` | Agregar/modificar tests | (no incrementa) | `test: add unit tests` |
| `build` | Cambios en build o dependencias | (no incrementa) | `build: update webpack` |
| `ci` | Cambios en CI/CD | (no incrementa) | `ci: add GitHub Actions` |
| `chore` | Cambios misceláneos | (no incrementa) | `chore: update deps` |

#### Ejemplos Válidos:

```bash
# Incremental feature
git commit -m "feat: add user notifications"

# Bug fix
git commit -m "fix: resolve token expiration bug"

# Breaking change (incrementa MAJOR)
git commit -m "feat!: redesign authentication flow"
# O con cuerpo:
git commit -m "feat: change API endpoint

BREAKING CHANGE: old endpoint /api/v1/users is deprecated"

# Chore (no incrementa versión)
git commit -m "chore: update dependencies"
```

### 2. Flujo Automático en GitHub

Cuando haces **push a `main`**:

1. **GitHub Actions** ejecuta el workflow `release.yml`
2. **Semantic Release** analiza todos los commits desde la última versión
3. **Calcula nueva versión**:
   - Si hay `feat:` → MINOR (1.0.0 → 1.1.0)
   - Si hay `fix:` o `perf:` → PATCH (1.0.0 → 1.0.1)
   - Si hay `feat!:` o `BREAKING CHANGE:` → MAJOR (1.0.0 → 2.0.0)
4. **Actualiza** automáticamente:
   - `package.json` con nueva versión
   - `CHANGELOG.md` con notas de release
   - Git tags (ej: `v1.2.3`)
   - GitHub Releases
5. **Builds** posteriores detectan la nueva versión:
   - Docker images con tags semánticos
   - Header muestra `v1.2.3`

### 3. Validación Local (Hook pre-commit)

Si tenés **husky** configurado, tus commits serán validados automáticamente:

```bash
git commit -m "invalid message"
# ✘ Error: commit message must be conventional
```

Para ver las reglas de validación, consulta `.commitlintrc.json`.

## Versión en la Aplicación

### Dónde se Muestra

- **Header** (componente superior): "Planning Task" con versión debajo tipo "v1.2.3"

### Cómo Funciona

1. **Build-time**: Next.js lee `package.json` (actualizado por semantic-release)
2. **Inyección**: Crea variable de entorno `NEXT_PUBLIC_APP_VERSION`
3. **Runtime**: Header importa y muestra la versión

### Código Relevante

- **Constante**: [`lib/constants/appVersion.ts`](lib/constants/appVersion.ts)
- **Componente**: [`components/dashboard/Header.tsx`](components/dashboard/Header.tsx#L36)
- **Estilos**: [`components/dashboard/Header.module.css`](components/dashboard/Header.module.css#L48-L54)

## Configuración

### `.releaserc.json`

- Define branches (main y develop con pre-releases)
- Configura plugins para changelog, git, npm y GitHub
- Automáticamente actualiza archivos especificados

### `.github/workflows/release.yml`

- Se ejecuta en push a main/develop
- Ejecuta semantic-release
- Usa GITHUB_TOKEN para crear releases

### `.commitlintrc.json`

- Valida formato de commits
- Extiende `@commitlint/config-conventional`

### `next.config.js`

- Inyecta `NEXT_PUBLIC_APP_VERSION` en tiempo de build
- Usa versión de `package.json`

## Flujo Ejemplo Completo

```bash
# 1. Desarrollo
git checkout -b feat/dark-mode
# ... haces cambios ...

# 2. Commit con formato convencional
git commit -m "feat: add dark mode toggle"

# 3. Push
git push origin feat/dark-mode

# 4. Pull request a main
# (github.com/tu-repo/pulls)

# 5. Merge a main
# (presionas "Merge pull request" en GitHub)

# 6. GitHub Actions automáticamente:
#    - Ejecuta semantic-release
#    - Detecta "feat:" en commits
#    - Incrementa MINOR: 1.0.0 → 1.1.0
#    - Actualiza package.json
#    - Crea commit "chore(release): 1.1.0"
#    - Genera CHANGELOG.md
#    - Crea Git tag "v1.1.0"
#    - Crea GitHub Release

# 7. Docker images se construyen con tags:
#    - docker.io/user/scrum-task-manager:1.1.0
#    - docker.io/user/scrum-task-manager:1.1
#    - docker.io/user/scrum-task-manager:latest

# 8. La app muestra en el header: "Planning Task v1.1.0"
```

## Verificación Local (Opcional)

Para ver cómo semantic-release interpretaría tus commits sin hacer cambios reales:

```bash
npm run semantic-release -- --dry-run
```

**Nota**: Requiere configuración correcta de git remote y permisos.

## Troubleshooting

### Los commits no actualizan la versión

**Problema**: Hiciste push pero la versión no cambió.

**Solución**: Verifica que tus commits sigan Conventional Commits:
```bash
git log --oneline | head -5
# Debe ver: feat: ..., fix: ..., etc.
```

### Quiero cambiar el formato de versión

Modifica en `next.config.js`:
```javascript
// Ahora en Header.tsx
<span className={styles.versionText}>Version {APP_VERSION}</span>
```

O en `lib/constants/appVersion.ts`:
```typescript
export const APP_VERSION = `v${process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}`
```

### Quiero hacer release manual

En GitHub Actions, el workflow `release.yml` se puede ejecutar manualmente si es necesario (futuro: agregar workflow_dispatch si lo necesitas).

## Recursos Adicionales

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Release](https://semantic-release.gitbook.io/)
- [Semantic Versioning](https://semver.org/)
- [Commitlint](https://commitlint.js.org/)
