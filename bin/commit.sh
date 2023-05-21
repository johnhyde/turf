#!/bin/bash

usage() { printf "Usage: $0 URBIT_DESK_DIRECTORY\n" 1>&2; exit 1; }

cdir=$(dirname $0)

if [ $# -eq 0 ]; then
    usage
    exit 2
fi
DESK_DIR=${@: -1}
DESK_DIR="${DESK_DIR/#\~/$HOME}"
PIER=$(dirname $DESK_DIR)
DESK=$(basename $DESK_DIR)

port=$(cat $PIER/.http.ports | grep loopback | tr -s ' ' '\n' | head -n 1)

lensa() {
    curl -s                                                              \
    --data "{\"source\":{\"dojo\":\"$2\"},\"sink\":{\"app\":\"$1\"}}"  \
    "http://localhost:$port" | xargs printf %s | sed 's/\\n/\n/g'
}

lensa 'hood' "+hood/commit %$DESK"
