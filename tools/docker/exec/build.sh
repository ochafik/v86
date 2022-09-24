#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../.."

docker build -t v86:build-env -f tools/docker/exec/Dockerfile .
docker run --rm -it -v $PWD:/v86 v86:build-env make all

python3 -m http.server 8000 || \
  docker run --rm -it -p 8000:8000 -v $PWD:/v86 python:3.9.6-alpine3.14 \
    sh -c "cd v86 && python3 -m http.server 8000"
