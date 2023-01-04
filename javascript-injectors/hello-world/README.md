# Setup web asset with Javascript Injection

This example shows how to setup a web asset and inject Javascript into it using the [Screenly CLI](https://github.com/Screenly/cli)

## Setup Screenly CLI

To be able to use this example, you need to setup the [Screenly CLI](https://github.com/Screenly/cli)

## Add a web asset
You'll need to add a web asset to Screenly before injecting Javascript.

To add a new web asset:

```sh
./screenly asset add <URL> <ASSET_NAME>
```

Replace `<URL>` with the url of the web asset and `<ASSET_NAME>` with the name you would like to give the asset.

This will generate an ID, which will be used in the next step.

## Inject Javascript

To inject Javascript,

```sh
./screenly asset inject-js <ASSET_ID> <PATH_TO_YOUR_JS_FILE>
```

where:
- `<ASSET_ID>` is the ID of the asset generated from the previous step
- `<PATH_TO_YOUR_JS_FILE>` is the path of the javascript file that you want to inject.