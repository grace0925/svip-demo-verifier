#!/bin/bash
set -e
cd ./images
dockerComposeFiles="-f docker-compose-couchdb.yml -f docker-compose-issuer.yml -f docker-compose-wallet.yml"
docker-compose $dockerComposeFiles down --remove-orphans --rmi all && docker-compose $dockerComposeFiles up --force-recreate
