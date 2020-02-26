#
#
#
#
set -e
cd ./cmd
dockerComposeFiles="-f docker-compose-issuer.yml -f docker-compose-wallet.yml"
(docker-compose $dockerComposeFiles down --rmi all && docker-compose $dockerComposeFiles up --force-recreate)
