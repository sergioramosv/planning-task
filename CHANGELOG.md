# Changelog

Todos los cambios importantes de este proyecto están documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
