#!/bin/bash

usage() { printf "Usage: $0 URBIT_GLOBBER_DESK_DIRECTORY" 1>&2; exit 1; }

cdir=$(dirname $0)

if [ $# -eq 0 ]; then
    usage
    exit 2
fi
DESK="${1//\~/$HOME}"
GLOBS="$DESK/../.urb/put"
GLOB=$(ls -t $GLOBS | head -1)
TARGET_GLOBS="$cdir"/../globs/
mkdir -p $TARGET_GLOBS
cp "$GLOBS/$GLOB" $TARGET_GLOBS/
HASH="${GLOB//glob-/}"
HASH="${HASH//.glob/}"
echo $HASH
