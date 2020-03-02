#!/bin/bash
sleep 5
curl -X PUT http://admin:securekey@localhost:5984/_users
curl -X PUT http://admin:securekey@localhost:5984/user_info
curl -X PUT http://admin:securekey@localhost:5984/vc_wallet
