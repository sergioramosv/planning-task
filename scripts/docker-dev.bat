@echo off
REM Docker Development Quick Start Script for Windows
REM Uso: docker-dev.bat [command]
REM Comandos: start, stop, restart, logs, shell, test, lint, clean

setlocal enabledelayedexpansion

set "CONTAINER_NAME=scrum-app-dev"
set "SERVICE_NAME=app-dev"

REM Obtener directorio del proyecto
for %%I in ("%~dp0..") do set "PROJECT_DIR=%%~fI"

cls

REM Verificar si Docker está ejecutándose
echo Verificando Docker...
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker no está ejecutándose
    echo Por favor, inicia Docker Desktop
    pause
    exit /b 1
)
echo [OK] Docker está ejecutándose

REM Procesar comando
set "COMMAND=%1"
if "!COMMAND!"=="" set "COMMAND=help"

if /i "!COMMAND!"=="start" goto cmd_start
if /i "!COMMAND!"=="stop" goto cmd_stop
if /i "!COMMAND!"=="restart" goto cmd_restart
if /i "!COMMAND!"=="logs" goto cmd_logs
if /i "!COMMAND!"=="shell" goto cmd_shell
if /i "!COMMAND!"=="test" goto cmd_test
if /i "!COMMAND!"=="lint" goto cmd_lint
if /i "!COMMAND!"=="status" goto cmd_status
if /i "!COMMAND!"=="build" goto cmd_build
if /i "!COMMAND!"=="clean" goto cmd_clean
if /i "!COMMAND!"=="help" goto cmd_help

echo [ERROR] Comando desconocido: !COMMAND!
goto cmd_help

:cmd_start
echo.
echo Iniciando contenedor de desarrollo...
docker-compose up -d !SERVICE_NAME!
echo [OK] Contenedor iniciado
echo.
echo Esperando a que el servidor esté listo...
timeout /t 3 /nobreak
echo.
echo Abriendo navegador en http://localhost:3300...
start http://localhost:3300
echo.
echo Mostrando logs en tiempo real (Ctrl+C para salir)...
docker-compose logs -f !SERVICE_NAME!
goto end

:cmd_stop
echo.
echo Deteniendo contenedor...
docker-compose stop !SERVICE_NAME!
echo [OK] Contenedor detenido
goto end

:cmd_restart
echo.
echo Reiniciando contenedor...
docker-compose restart !SERVICE_NAME!
echo [OK] Contenedor reiniciado
echo.
echo Esperando a que esté listo...
timeout /t 2 /nobreak
echo.
echo Mostrando logs...
docker-compose logs -f !SERVICE_NAME!
goto end

:cmd_logs
echo.
echo Mostrando logs en tiempo real (Ctrl+C para salir)...
docker-compose logs -f !SERVICE_NAME!
goto end

:cmd_shell
echo.
echo Abriendo shell en el contenedor...
docker-compose exec !SERVICE_NAME! sh
goto end

:cmd_test
echo.
echo Ejecutando tests...
docker-compose exec !SERVICE_NAME! npm test
goto end

:cmd_lint
echo.
echo Ejecutando linter...
docker-compose exec !SERVICE_NAME! npm run lint
goto end

:cmd_status
echo.
echo Estado del contenedor:
docker-compose ps !SERVICE_NAME!
goto end

:cmd_build
echo.
echo Reconstruyendo imagen...
docker-compose build --no-cache !SERVICE_NAME!
echo [OK] Imagen reconstruida
goto end

:cmd_clean
echo.
echo [ADVERTENCIA] Esto eliminará el contenedor e imagen
set /p "CONFIRM=¿Estás seguro? (s/n): "
if /i "!CONFIRM!"=="s" (
    docker-compose down --rmi all --volumes
    echo [OK] Limpieza completada
) else (
    echo Operación cancelada
)
goto end

:cmd_help
cls
echo.
echo ================================================================================
echo  Docker Development Helper Script
echo ================================================================================
echo.
echo Uso:
echo   docker-dev.bat [command]
echo.
echo Comandos:
echo   start       - Inicia el contenedor de desarrollo
echo   stop        - Detiene el contenedor
echo   restart     - Reinicia el contenedor
echo   logs        - Muestra logs en tiempo real
echo   shell       - Abre una shell en el contenedor
echo   test        - Ejecuta los tests
echo   lint        - Ejecuta el linter
echo   status      - Muestra el estado del contenedor
echo   build       - Reconstruye la imagen
echo   clean       - Elimina contenedor e imagen
echo   help        - Muestra esta ayuda
echo.
echo Ejemplos:
echo   docker-dev.bat start      # Inicia desarrollo
echo   docker-dev.bat logs       # Ver logs
echo   docker-dev.bat test       # Ejecutar tests
echo   docker-dev.bat shell      # Entrar en el contenedor
echo.
echo Notas:
echo   - La aplicación estará disponible en http://localhost:3300
echo   - Los cambios en el código se reflejarán automáticamente (hot-reload)
echo   - Los logs mostrarán los cambios detectados en tiempo real
echo.
echo ================================================================================
echo.
goto end

:end
endlocal
