#!/usr/bin/env bash
set -veu

IMAGES="$(dirname "$0")"/../../images
TOOLS="$(dirname "$0")"/../../tools

IMAGE_NAME=$1
shift 1

if [[ $# -eq 1 ]]; then
  OUT_ROOTFS_TAR="$IMAGES"/$1.tar
  OUT_ROOTFS_FLAT="$IMAGES"/$1
  OUT_FSJSON="$IMAGES"/$1.json
else
  OUT_ROOTFS_TAR="$IMAGES"/$1
  OUT_ROOTFS_FLAT="$IMAGES"/$2
  OUT_FSJSON="$IMAGES"/$3
fi

CONTAINER_NAME=tmp_${IMAGE_NAME//[^a-zA-Z0-9_-]/_}_${RANDOM}

mkdir -p "$IMAGES"

trap "docker rm '$CONTAINER_NAME'" EXIT

# docker build . --platform linux/386 --rm --tag "$IMAGE_NAME"
docker rm "$CONTAINER_NAME" || true
docker create --platform linux/386 -t -i --name "$CONTAINER_NAME" "$IMAGE_NAME" bash

docker export "$CONTAINER_NAME" > "$OUT_ROOTFS_TAR"

"$TOOLS/fs2json.py" --out "$OUT_FSJSON" "$OUT_ROOTFS_TAR"

# Note: Not deleting old files here
mkdir -p "$OUT_ROOTFS_FLAT"
"$TOOLS/copy-to-sha256.py" "$OUT_ROOTFS_TAR" "$OUT_ROOTFS_FLAT"

echo "$OUT_ROOTFS_TAR", "$OUT_ROOTFS_FLAT" and "$OUT_FSJSON" created.
