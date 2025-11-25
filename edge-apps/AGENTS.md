# Edge Apps In-Depth

## Overview

Edge Apps is a framework for building and running content on Screenly's digital signage screens.

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
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="static/css/common.css" rel="stylesheet">
  <link href="static/css/style.css" rel="stylesheet">
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

## Creating a Vue-based Edge App via the template

To create a new project, run the following command:

```bash
cd edge-apps/
bun create --no-git edge-app-template <edge-app-name>
```

You have to be inside the `edge-apps` directory to run this command successfully.
This will create a new Edge App with the name `<edge-app-name>` in the `edge-apps` directory.

These kind of Edge Apps are written in Vue and TypeScript. All of those projects use Bun for runtime and Vite for build system.

# CSS

- Always use `rem` instead of `px` when specifying values like font size, margins, paddings, etc.
- Avoid using `!important` as it breaks the natural cascading behavior of CSS. Instead, use more specific selectors or leverage CSS custom properties (variables) for values that need to be overridden.
- Use CSS custom properties (variables) for theme values, colors, and other design tokens that need to be overridden.
- Do not add code comments to CSS code unless it's not obvious what the code does.
- This project uses [Super Linter](mdc:https:/github.com/github/super-linter) for linting.
  - Stylelint is used for linting CSS files.
- Use Stylelint's rules (https://stylelint.io/user-guide/rules) as guide when generate code.

# SCSS

- All Edge Apps written in Vue and TypeScript use SCSS for styling.
- While it's okay to use CSS, you should prefer SCSS whenever possible.
- Always use `rem` instead of `px` when specifying values like font size, margins, paddings, etc.
- Avoid using `!important` as it breaks the natural cascading behavior of CSS. Instead, use more specific selectors or leverage CSS custom properties (variables) for values that need to be overridden.
- Use CSS custom properties (variables) for theme values, colors, and other design tokens that need to be overridden.
- Do not add code comments to SCSS code unless it's not obvious what the code does.
