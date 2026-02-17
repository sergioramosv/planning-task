# Changelog

Todos los cambios importantes de este proyecto están documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
