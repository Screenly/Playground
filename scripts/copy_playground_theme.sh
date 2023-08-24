#!/bin/bash

set -euo pipefail

if [ -z "${EDGE_APP_PATH:-}" ]; then
    echo "EDGE_APP_PATH environment variable is not set. "
    echo "Please set this variable to the path of your Edge App."
    exit 1
fi

if [ ! -f "${EDGE_APP_PATH}/screenly.yml" ]; then
    echo "screenly.yml not found in: $(readlink -f ${EDGE_APP_PATH})"
    echo "Please make sure you have set EDGE_APP_PATH correctly."
    exit 1
fi

cp -r ./bootstrap "${EDGE_APP_PATH}"
rm "${EDGE_APP_PATH}/bootstrap/README.md"
