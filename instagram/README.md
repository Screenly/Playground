# Instagram Edge App

## Setup

To build the container, run the below command from the root directory:

`docker build -t --rm screenly/instagram -f instagram/Dockerfile .`

To run the container, run:
```sh
docker run \
  -e INSTAGRAM_API_TOKEN=<YOUR_INSTAGRAM_API_TOKEN> \
  -v $(pwd)/instagram:/usr/app/instagram \
  -v $(pwd)/bootstrap:/usr/app/bootstrap \
  screenly/instagram
```

Make sure you replace `<YOUR_INSTAGRAM_API_TOKEN>` with your API token before running the above command.

This will create a directory called `dist` inside the `instagram` directory which will have the generated `index.html` file.

### Add the HTML file to Screenly

To add the HTML file, you'll need to setup [Screenly CLI](https://github.com/Screenly/cli).
Once that's done, run:

```sh
screenly asset add [path]
```

where `[path]` is the location of your `dist/index.html` file

This will upload the generated HTML file and make it available to be used as an edge app.
