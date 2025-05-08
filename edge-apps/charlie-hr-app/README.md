# Screenly Welcome App

A customizable welcome screen app that lets users display a personalized greeting or message on their digital signage. Easily configure the heading and body text via the Screenly dashboard, making it ideal for receptions, events, or branded displays.

![Welcome Message App](./static/img/welcome-app-preview.png)

## tl;dr

```bash
$ cd edge-apps/welcome-app
$ screenly edge-app create \
    --name welcome-app \
    --in-place
$ screenly edge-app deploy
# To install an app, you need to create an instance.
$ screenly edge-app instance create
```

## Tweaking the settings

### `welcome_heading`

To configure the heading of the message app, utilize the `welcome_heading` settings.

```bash
$ screenly edge-app setting set welcome_heading='Welcome'
# A relatively long console output...
Edge app setting successfully set.
```

The welcome app's heading should be defined as a string in the format: "This is message head".

### `welcome_message`

To configure the heading of the message app, utilize the `welcome_message` settings.

```bash
$ screenly edge-app setting set welcome_message='to the team'
# A relatively long console output...
Edge app setting successfully set.
```

The welcome app's message should be defined as a string in the format: "This is message body".

### `theme` (optional)

Specifies the application's theme color and logo style. Available options are 'light' or 'dark'.

This setting determines the overall theme appearance and adjusts the logo accordingly and you can change your default value in the Screenly settings page.

```bash
$ screenly edge-app setting set theme='light'
# A relatively long console output...
Edge app setting successfully set.
```

### `override_timezone` (optional)

For instance, if you want to clock app to display the current date and time in London,
run the following command:

```bash
$ screenly edge-app setting set override_timezone='Europe/Paris'
# A relatively long console output...
Edge app setting successfully set.

$ screenly edge-app setting set override_locale='fr'
# A relatively long console output...
Edge app setting successfully set.
```

See [this page](https://momentjs.com/) for the list of all possible values for the time zone.
Alternatively, you can call `moment.locales()`, which returns all the supported locale values.

Setting invalid values for the timezone won't crash the app itself, it'll just fall back to the default time.
