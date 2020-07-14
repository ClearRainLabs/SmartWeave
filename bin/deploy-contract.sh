#!/bin/bash
# Pass in key-file location to script

echo "running the script"

node smartweave-cli --key-file $1 \
  --create --contract-src build/community.js \
  --init-state initialState.json
