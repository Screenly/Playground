# Screenly Welcome App

A simple message app allows users to display text on a screen, making it a basic tool for digital signage. Users can input and edit both the heading and message body directly from the Screenly dashboard.

![Simple Message App](./static/img/message-app-preview.png)

## tl;dr

```bash
$ cd edge-apps/countdown-timer
$ screenly edge-app create \
    --name simple-message-app \
    --in-place
$ screenly edge-app deploy
# To install an app, you need to create an instance.
$ screenly edge-app instance create

```

## Tweaking the settings

### `message_head`

To configure the heading of the message app, utilize the `message_head` settings.

```bash
$ screenly edge-app setting set message_head='This is message head'
# A relatively long console output...
Edge app setting successfully set.
```
The message app's heading should be defined as a string in the format: "This is message head".

### `message_body`

To define the content of the message app's body, utilize the `message_body` settings.

```bash
$ screenly edge-app setting set message_body='This is message body'
# A relatively long console output...
Edge app setting successfully set.
```

### `theme`

Specifies the application's theme color and logo style. Available options are 'light' or 'dark'.

This setting determines the overall theme appearance and adjusts the logo accordingly and you can change your default value in the Screenly settings page.

```bash
$ screenly edge-app setting set theme='light'
# A relatively long console output...
Edge app setting successfully set.
```

### `override_timezone`

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