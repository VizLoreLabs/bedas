ARCH=`uname -m`
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ARCH=$ARCH docker-compose -f "${DIR}"/docker-compose.yml down
export DOCKER_CLIENT_TIMEOUT=120
export COMPOSE_HTTP_TIMEOUT=120
ARCH=$ARCH docker-compose -f "${DIR}"/docker-compose.yml up -d