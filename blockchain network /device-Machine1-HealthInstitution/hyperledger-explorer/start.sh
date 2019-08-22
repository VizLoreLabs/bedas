docker-compose -f docker-compose-explorer.yaml down
export DOCKER_CLIENT_TIMEOUT=120
export COMPOSE_HTTP_TIMEOUT=120
docker-compose -f docker-compose-explorer.yaml up -d