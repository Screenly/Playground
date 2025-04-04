# Screenly Asset Metadata

![Screenly Asset Metadata App Preview](static/images/asset-metadata-app-preview.jpg)

This Edge App displays the screen metadata - Hostname, Screen Name, Position , Hardware name, Firmware version, Labels, etc.

## Installation

```bash
$ cd edge-apps/asset-metadata
$ screenly edge-app create \
    --name my-asset-metadata \
    --in-place
$ screenly edge-app deploy
[...]
$ screenly edge-app instance create
```
