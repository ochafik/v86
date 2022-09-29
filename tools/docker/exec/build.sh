#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../.."

echo '
  FROM alpine:3.14
  RUN apk add --update curl clang make openjdk8 npm python3 zstd
  RUN curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y 
  ENV PATH "/root/.cargo/bin:${PATH}"
  RUN rustup target add wasm32-unknown-unknown
  WORKDIR /v86
' | docker build -t v86:build-env -f - .

docker run --rm -it -v $PWD:/v86 v86:build-env make -j all
make site run

# Start a local server
# Note: if python3 is installed, simply run:
#   python3 -m http.server 8000
# docker run --rm -it \
#   -v $PWD:/v86 \
#   v86:build-env \
#   make run
