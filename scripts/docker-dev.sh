#!/bin/bash

# Docker Development Quick Start Script
# Uso: ./scripts/docker-dev.sh [command]
# Comandos: start, stop, restart, logs, shell, test, lint, clean

set -e

CONTAINER_NAME="scrum-app-dev"
SERVICE_NAME="app-dev"
PROJECT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar si Docker está ejecutándose
check_docker() {
    if ! docker ps &> /dev/null; then
        print_error "Docker no está ejecutándose"
        print_info "Por favor, inicia Docker Desktop"
        exit 1
    fi
    print_success "Docker está ejecutándose"
}

# Funciones de comando
cmd_start() {
    print_info "Iniciando contenedor de desarrollo..."
    check_docker

    if docker-compose ps $SERVICE_NAME | grep -q "Up"; then
        print_warning "El contenedor ya está ejecutándose"
        return
    fi

    docker-compose up -d $SERVICE_NAME
    print_success "Contenedor iniciado"

    print_info "Esperando a que el servidor esté listo..."
    sleep 3

    print_info "Abriendo navegador en http://localhost:3300..."
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:3300" &
    elif command -v open &> /dev/null; then
        open "http://localhost:3300" &
    fi

    cmd_logs
}

cmd_stop() {
    print_info "Deteniendo contenedor..."
    docker-compose stop $SERVICE_NAME
    print_success "Contenedor detenido"
}

cmd_restart() {
    print_info "Reiniciando contenedor..."
    docker-compose restart $SERVICE_NAME
    print_success "Contenedor reiniciado"

    print_info "Esperando a que esté listo..."
    sleep 2
    cmd_logs
}

cmd_logs() {
    print_info "Mostrando logs en tiempo real (Ctrl+C para salir)..."
    echo ""
    docker-compose logs -f $SERVICE_NAME
}

cmd_shell() {
    print_info "Abriendo shell en el contenedor..."
    docker-compose exec $SERVICE_NAME sh
}

cmd_test() {
    print_info "Ejecutando tests..."
    docker-compose exec $SERVICE_NAME npm test
}

cmd_lint() {
    print_info "Ejecutando linter..."
    docker-compose exec $SERVICE_NAME npm run lint
}

cmd_clean() {
    print_warning "Eliminando contenedor y volúmenes..."
    read -p "¿Estás seguro? (s/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        docker-compose down --rmi all --volumes
        print_success "Limpieza completada"
    else
        print_info "Operación cancelada"
    fi
}

cmd_status() {
    print_info "Estado del contenedor:"
    docker-compose ps $SERVICE_NAME
}

cmd_build() {
    print_info "Reconstruyendo imagen..."
    docker-compose build --no-cache $SERVICE_NAME
    print_success "Imagen reconstruida"
}

cmd_help() {
    cat << EOF
${BLUE}╔════════════════════════════════════════════════════════╗${NC}
${BLUE}║  Docker Development Helper Script                      ║${NC}
${BLUE}╚════════════════════════════════════════════════════════╝${NC}

${GREEN}Uso:${NC}
  ./scripts/docker-dev.sh [command]

${GREEN}Comandos:${NC}
  ${YELLOW}start${NC}       - Inicia el contenedor de desarrollo
  ${YELLOW}stop${NC}        - Detiene el contenedor
  ${YELLOW}restart${NC}     - Reinicia el contenedor
  ${YELLOW}logs${NC}        - Muestra logs en tiempo real
  ${YELLOW}shell${NC}       - Abre una shell en el contenedor
  ${YELLOW}test${NC}        - Ejecuta los tests
  ${YELLOW}lint${NC}        - Ejecuta el linter
  ${YELLOW}status${NC}      - Muestra el estado del contenedor
  ${YELLOW}build${NC}       - Reconstruye la imagen
  ${YELLOW}clean${NC}       - Elimina contenedor e imagen
  ${YELLOW}help${NC}        - Muestra esta ayuda

${GREEN}Ejemplos:${NC}
  ./scripts/docker-dev.sh start      # Inicia desarrollo
  ./scripts/docker-dev.sh logs       # Ver logs
  ./scripts/docker-dev.sh test       # Ejecutar tests
  ./scripts/docker-dev.sh shell      # Entrar en el contenedor

${GREEN}Notas:${NC}
  • La aplicación estará disponible en http://localhost:3300
  • Los cambios en el código se reflejarán automáticamente (hot-reload)
  • Los logs mostrarán los cambios detectados en tiempo real

EOF
}

# Punto de entrada principal
main() {
    local command="${1:-help}"

    case $command in
        start)
            cmd_start
            ;;
        stop)
            cmd_stop
            ;;
        restart)
            cmd_restart
            ;;
        logs)
            cmd_logs
            ;;
        shell)
            cmd_shell
            ;;
        test)
            cmd_test
            ;;
        lint)
            cmd_lint
            ;;
        status)
            cmd_status
            ;;
        build)
            cmd_build
            ;;
        clean)
            cmd_clean
            ;;
        help|--help|-h|"")
            cmd_help
            ;;
        *)
            print_error "Comando desconocido: $command"
            echo ""
            cmd_help
            exit 1
            ;;
    esac
}

# Ejecutar
main "$@"
