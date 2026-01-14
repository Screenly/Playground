# Edge Apps In-Depth

## Overview

Edge Apps is a framework for building and running content on Screenly's digital signage screens.

## Manifest Files

Edge Apps use manifest files to define metadata and configuration for your app. The default manifest file is `screenly.yml`, which is automatically created when you generate a new Edge App.

The manifest file contains important information about your Edge App, including:

- **Basic metadata**: An ID, description, icon, and author name
- **Entry point**: How the app should be loaded (from a local file or remote URL)
- **Settings**: Configurable key-value pairs that users can customize when installing or managing instances of your app (e.g., API keys, greeting messages, or other options)
- **Secrets**: Secure storage for sensitive data like authentication tokens
- **Ready signal**: Configuration for controlling when the app renders on the player

For comprehensive documentation on manifest files, including all available fields and configuration options, see the [Screenly manifest file documentation](https://developer.screenly.io/edge-apps/#manifest-file).

### Settings in Manifest Files

When adding settings to your manifest file, follow these guidelines:

- **Alphabetical sorting**: Settings must be sorted alphabetically by their key names. This improves maintainability and makes it easier to find settings.
- **Help text format**: While `help_text` can be written as a simple string, it's recommended to use a structured format with `schema_version` and `properties` when appropriate. This format instructs the UI how to render the input field in the web interface without changing the underlying storage type.
- **Input field types**: The structured `help_text` format supports the following input types:
  - `datetime`: For date and time selection
  - `number`: For numeric input
  - `select`: For dropdown selection
  - `boolean`: For switch/toggle input
  - `textarea`: For multi-line text input
  - `url`: For URL input

Example of structured `help_text`:

```yaml
settings:
  number_field:
    type: string
    title: Attendee Count
    optional: false
    help_text:
      schema_version: 1
      properties:
        help_text: The expected count of attendees
        type: number
```

This approach provides a better user experience in the web interface by rendering the appropriate input control while keeping the value stored as a string.

## Writing an Edge App from Scratch

This rule applies to Edge Apps that are written in plain HTML, CSS, and JavaScript.

- Create a directory inside the [edge-apps](mdc:edge-apps) directory.
- That new directory should at least contain the following files:
  - `index.html`
  - `screenly.yml`
- See [this documentation about getting started with Edge Apps](mdc:https://developer.screenly.io/edge-apps/#getting-started) for details.
- While you can put your JavaScript code inside the `index.html` file, you can also put it inside a file `static/js/main.js`.

### `index.html`

Here's a template that you can use when generating the file:

```html
<!doctype html>
<html>
  <head>
    <title>Welcome App - Screenly Edge App</title>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="static/css/common.css" rel="stylesheet" />
    <link href="static/css/style.css" rel="stylesheet" />
  </head>

  <body>
    <script src="screenly.js?version=1"></script>
    <script src="static/js/main.js"></script>
  </body>
</html>
```

### `static/js/main.js`

This file should at least contain the following.

```javascript
/* global screenly */

document.addEventListener('DOMContentLoaded', async () => {
  // ...
  screenly.signalReadyForRendering()
})
```

`screenly.signalReadyForRendering()` tells the device that the Edge App is ready to be displayed on the screen. See this [documentation about the ready signal](mdc:https://developer.screenly.io/edge-apps/#ready-signal) for details.

## CSS

- Always use `rem` instead of `px` when specifying values like font size, margins, paddings, etc.
- Avoid using `!important` as it breaks the natural cascading behavior of CSS. Instead, use more specific selectors or leverage CSS custom properties (variables) for values that need to be overridden.
- Use CSS custom properties (variables) for theme values, colors, and other design tokens that need to be overridden.
- Do not add code comments to CSS code unless it's not obvious what the code does.
- This project uses [Super Linter](mdc:https://github.com/github/super-linter) for linting.
  - Stylelint is used for linting CSS files.
- Use Stylelint's rules ([https://stylelint.io/user-guide/rules](https://stylelint.io/user-guide/rules)) as a guide when generating code.

## SCSS

- All Edge Apps written in Vue and TypeScript use SCSS for styling.
- While it's okay to use CSS, you should prefer SCSS whenever possible.
- Always use `rem` instead of `px` when specifying values like font size, margins, paddings, etc.
- Avoid using `!important` as it breaks the natural cascading behavior of CSS. Instead, use more specific selectors or leverage CSS custom properties (variables) for values that need to be overridden.
- Use CSS custom properties (variables) for theme values, colors, and other design tokens that need to be overridden.
- Do not add code comments to SCSS code unless it's not obvious what the code does.
