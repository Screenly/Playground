#!/bin/bash

set -euo pipefail

if [ ! -f "$(pwd)/screenly.yml" ]; then
    echo "screenly.yml not found in: $(pwd)"
    echo "Please make sure that you're inside an edge-apps/<EDGE_APP_NAME> directory"
    exit 1
fi

cp -r ../../bootstrap .
