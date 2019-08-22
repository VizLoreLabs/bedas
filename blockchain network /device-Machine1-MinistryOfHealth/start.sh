ARCH=`uname -m`
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ARCH=$ARCH docker-compose -f "${DIR}"/docker-compose.yml down
export DOCKER_CLIENT_TIMEOUT=120
export COMPOSE_HTTP_TIMEOUT=120
ARCH=$ARCH docker-compose -f "${DIR}"/docker-compose.yml up -d
echo "[INFO] Sleeping for 10 seconds, waiting for docker images to start."
sleep 10
docker exec peer0.machine1.ministryofhealth.com peer channel create -o orderer.com:7050 -c ordering -f /etc/hyperledger/configtx/artifacts/channel/ordering_tx.pb
sleep 2
docker exec peer0.machine1.ministryofhealth.com peer channel update -c ordering -f /etc/hyperledger/configtx/artifacts/channel/ordering_MinistryOfHealthMSPanchors_tx.pb -o orderer.com:7050

sleep 2
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@MinistryOfHealth.peerorg.com/msp" peer0.machine1.ministryofhealth.com peer channel fetch 0 -o orderer.com:7050 -c ordering
sleep 2
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@MinistryOfHealth.peerorg.com/msp" peer0.machine1.ministryofhealth.com peer channel join -b ordering_0.block -o orderer.com:7050
sleep 2
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@MinistryOfHealth.peerorg.com/msp" peer1.machine1.ministryofhealth.com peer channel fetch 0 -o orderer.com:7050 -c ordering
sleep 2
docker exec -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@MinistryOfHealth.peerorg.com/msp" peer1.machine1.ministryofhealth.com peer channel join -b ordering_0.block -o orderer.com:7050