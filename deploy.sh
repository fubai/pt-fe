#!/bin/bash

if [ "$1" == "prod" ]; then
  SERVER="8.136.226.41"
else
  SERVER="119.45.208.214"
fi

npm run build --registry=https://registry.npm.taobao.org

ssh root@$SERVER "rm -rf /root/app/pt-fe"

scp -r dist root@$SERVER:/root/app/pt-fe
