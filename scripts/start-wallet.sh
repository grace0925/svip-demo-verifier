#!/bin/bash
set -e
cd ./cmd
dockerComposeFiles="-f docker-compose-wallet.yml"
docker-compose $dockerComposeFiles down --remove-orphans --rmi all && docker-compose $dockerComposeFiles up -d --force-recreate
