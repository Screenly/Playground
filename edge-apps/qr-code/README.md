# QR code generation

This example shows how to generate a QR code from a URL and display it on the screen.

## Deploying the example

If you haven't created an Edge App yet, run the following command:

```bash
screenly edge-app create \
    --name my-qr-code \
    --in-place
```

Make sure to copy the Playground theme into the app directory by running the following:

```bash
../../scripts/copy_playground_theme.sh
```

It's essential to include the dependency above or else the app will not be displayed properly.

To deploy the example, run the following command:

```bash
screenly edge-app upload
```

## Using the `generateQrCode` function

The `generateQrCode` function (inside `static/js/main.js`) takes a URL and
returns a QR code image as an SVG string. Here's an example of how to use it:

```js
generateQrCode(
  'https://screenly.io',
  options,
  enableUtm = false,
  callback = (svgElement) => {
    document.body.appendChild(svgElement);
  },
);
```

If `enableUtm` is set to `true`, the function will add the following query
parameters to the URL:

* `utm_source=screenly`
* `utm_medium=digital-signage`
* `utm_location=$SCREEN_LOCATION`
* `utm_placement=$SCREEN_HOSTNAME`

`utm_location` and `utm_placement` refers to the `location` and `hostname` of
the screen, respectively, which are derived from the Screenly metadata.
