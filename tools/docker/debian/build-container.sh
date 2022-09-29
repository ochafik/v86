#!/usr/bin/env sh
set -veu
cd $(dirname "$0")

IMAGE_NAME=i386/debian-full
docker build . --platform linux/386 --rm --tag "$IMAGE_NAME"
# ./build-fs.sh "$IMAGE_NAME" debian-9p-rootfs
../export-fs.sh "$IMAGE_NAME" debian-9p-rootfs.tar debian-9p-rootfs-flat debian-base-fs.json
