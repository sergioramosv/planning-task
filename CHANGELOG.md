# Changelog

Todos los cambios importantes de este proyecto están documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
