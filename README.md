# Screenly Playground

![Playground Logo](/images/playground.svg)

This repository holds various examples that showcases Screenly's features and API.

## Edge Apps

If you are not familiar with Edge Apps, we suggest you review our [developer documentation](https://developer.screenly.io/edge-apps/#getting-started).

- [3D Text](https://github.com/Screenly/Playground/tree/master/edge-apps/3d-text) - A 3D text display app that renders text with depth and shadow effects.
- [Asset Metadata](https://github.com/Screenly/Playground/tree/master/edge-apps/asset-metadata) - An example implementation of Screenly's metadata.
- [BambooHR App](https://github.com/Screenly/Playground/tree/master/edge-apps/bamboo-hr-app) - Displays employee birthdays, work anniversaries and other HR events from BambooHR.
- [Calendar App](https://github.com/Screenly/Playground/tree/master/edge-apps/calendar) - A simple calendar app that shows events from iCal data.
- [Clock App](https://github.com/Screenly/Playground/tree/master/edge-apps/clock) - A simple clock app.
- [Countdown Timer](https://github.com/Screenly/Playground/tree/master/edge-apps/countdown-timer) - A simple countdown timer app.
- [CharlieHR App](https://github.com/Screenly/Playground/tree/master/edge-apps/charlie-hr-app) - Displays employee birthdays, work anniversaries and other HR events from CharlieHR.
- [Fake Dashboard](https://github.com/Screenly/Playground/tree/master/edge-apps/fake-dashboard) - A simple fake dashboard screen to display simulated website analytics, including live visitor count, traffic sources, and device usage.
- [Flying Toasters App](https://github.com/Screenly/Playground/tree/master/edge-apps/flying-toasters) - A simple toaster app that flies around the screen.
- [iFrame App](https://github.com/Screenly/Playground/tree/master/edge-apps/iframe) - A simple iFrame app.
- [Power BI](https://github.com/Screenly/Playground/tree/master/edge-apps/powerbi) - A Power BI Edge App for securely accessing dashboards and reports.
- [QR Code Generator](https://github.com/Screenly/Playground/tree/master/edge-apps/qr-code) - An example of how to build unique QR Codes that embeds the screen metadata as UTM parameters.
- [RSS Reader](https://github.com/Screenly/Playground/tree/master/edge-apps/rss-reader) - A simple RSS reader.
- [Sonar Dashboard](https://github.com/Screenly/Playground/tree/master/edge-apps/sonar-dashboard) - A dashboard that displays the status of the [Sonar - BLE Device Counter](https://github.com/Viktopia/sonar).
- [Strava Club Leaderboard](https://github.com/Screenly/Playground/tree/master/edge-apps/strava-club-leaderboard) - A leaderboard of Strava club activities.
- [Simple Message App](https://github.com/Screenly/Playground/tree/master/edge-apps/simple-message-app) - A simple message app.
- [TFL Bus Status App](https://github.com/Screenly/Playground/tree/master/edge-apps/tfl-bus-status) - An app to display TFL Bus Status for a given bus stop. A list of all bus stops can be found here - [Bus Stop Lookup Tool](https://playground.srly.io/edge-apps/helpers/tfl/bus-stop-lookup/)
- [Weather App](https://github.com/Screenly/Playground/tree/master/edge-apps/weather) - A simple weather app.
- [Welcome App](https://github.com/Screenly/Playground/tree/master/edge-apps/welcome-app) - A customizable welcome screen app.

### Creating a new Edge App from the template

> [!WARNING]
> The current Edge App template (built with Vue) will be deprecated soon and will be replaced by a simpler template that doesn't rely on any specific framework.

Make sure that you have the following installed before proceeding:
- [Bun (1.2.2+)](https://bun.sh/docs/installation)
- [Screenly Edge App CLI (v1.0.3+)](https://github.com/Screenly/cli?tab=readme-ov-file#installation)

After installing `bun` and the Screenly CLI, run the following command to create a new Edge App:

```bash
cd edge-apps/
bun create --no-git edge-app-template <edge-app-name>
```

```plaintext
Created <edge-app-name> project successfully

# To get started, run:

  cd <edge-app-name>
  bun run dev
```

This will create a new Edge App with the name `<edge-app-name>` in the `edge-apps` directory.

> [!NOTE]
> Don't forget to update `README.md` and `screenly.yml` as needed.

You can now run the local development server with a single command:

```bash
cd <edge-app-name>
bun run dev
```

Follow the instructions in the `README.md` file of the new Edge App for more details.

### TypeScript Library (New)

The Playground also offers an Edge Apps library that contains utilities for building Edge Apps including helper functions.

Details on how to use the library can be found in [this guide](/edge-apps/edge-apps-library/README.md).

### TypeScript Library (Legacy)

> [!WARNING]
> This TypeScript library will be deprecated soon. Most of the common code, including Vue-specific components, will be merged into the new common library located in `edge-apps/edge-apps-library`. The current `blueprint` library will remain available until all dependent apps have migrated.

The Playground also offers an Edge Apps library that contains utilities for building Edge Apps including helper functions and reusable Vue components.
The source code is located inside the `edge-apps/blueprint` directory.

To install the library, run the following command:

```bash
bun add github:Screenly/Playground
```

This will install the latest version of the library in the default branch.

You can also specify a specific version or branch:

```bash
bun add github:Screenly/Playground#vX.Y.Z
bun add github:Screenly/Playground#[branch-name]
```

Details on how to use the library can be found in [this guide](/docs/edge-apps-library.md).

## Other

- [Bootstrap](https://github.com/Screenly/playground/tree/master/bootstrap/): A digital signage optimized Bootstrap theme for our Playground apps.
- [Dynamic Playlists](https://github.com/Screenly/playground/tree/master/dynamic-playlists/): An example of how to use Screenly's API to enable/disable a playlist based on weather conditions.
- [Instagram App](https://github.com/Screenly/playground/tree/master/instagram/): A basic Instagram app for Screenly.
- [JavaScript Injectors](https://github.com/Screenly/playground/tree/master/javascript-injectors/): Examples showing Screenly's JavaScript Injector.
