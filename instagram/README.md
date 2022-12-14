# Instagram Edge App

## Installation

Make sure you have `Node.js version 16+` installed on your system.
To install, run:

```
cd instagram
npm install
```

## Config
You will need to have an access token for the [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api/).

Once you have that, open `instagram/src/assets/scripts/script.js`. Search for `<YOUR_INSTAGRAM_TOKEN_HERE>` and replace it with your Instagram token.

### Build

To build the app, run:

```
npm run build
```

This will create a directory called `dist` which will have the generated `index.html` file.

### Add the HTML file to Screenly

To add the HTML file, you'll need to setup [Screenly CLI](https://github.com/Screenly/cli).
Once that's done, run:

```
screenly asset add [path]
```

where `[path]` is the location of your `dist/index.html` file

This will upload the generated HTML file and make it available to be used as an edge app.