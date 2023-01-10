# Asset Metadata Edge App

## Setup

To build the container, run the below command from the root directory:

`docker build -t screenly/asset-metadata-edge -f asset-metadata-edge/Dockerfile .`

To run the container, run:
```sh
docker run --rm \
  -e GOOGLE_MAPS_API_KEY=<GOOGLE_MAPS_API_KEY> \
  -v $(pwd)/asset-metadata-edge:/usr/app/asset-metadata-edge \
  -v $(pwd)/bootstrap:/usr/app/bootstrap \
  screenly/asset-metadata-edge
```

Make sure you replace `<GOOGLE_MAPS_API_KEY>` with your Google Maps API token before running the above command.

This will create a directory called `dist` inside the `asset-metadata-edge` directory which will have the generated `index.html` file.

### Add the HTML file to Screenly

To add the HTML file, you'll need to setup [Screenly CLI](https://github.com/Screenly/cli).
Once that's done, run:

```sh
screenly asset add [path]
```

where `[path]` is the location of your `dist/index.html` file

This will upload the generated HTML file and make it available to be used as an edge app.
