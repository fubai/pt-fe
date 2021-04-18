#!/bin/bash

npm run build --registry=https://registry.npm.taobao.org

ssh root@119.45.208.214 "rm -rf /root/app/pt-fe"

scp -r dist root@119.45.208.214:/root/app/pt-fe
