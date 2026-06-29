# Screenly Playground

![Playground Logo](/images/playground.svg)

This repository holds various examples that showcases Screenly's features and API.

## Edge Apps

If you are not familiar with Edge Apps, we suggest you review our [developer documentation](https://developer.screenly.io/edge-apps/#getting-started).

- [3D Text](https://github.com/Screenly/Playground/tree/master/edge-apps/3d-text) - A 3D text display app that renders text with depth and shadow effects.
- [Asset Metadata](https://github.com/Screenly/asset-metadata-app/) - An example implementation of Screenly's metadata. _(Moved to a separate repository)_
- [BambooHR App](https://github.com/Screenly/bamboo-hr-app/) - Displays employee birthdays, work anniversaries and other HR events from BambooHR. _(Moved to a separate repository)_
- [Calendar App](https://github.com/Screenly/calendar-app/) - A simple calendar app that shows events from iCal data. _(Moved to a separate repository)_
- [CAP Alerting](https://github.com/Screenly/Playground/tree/master/edge-apps/cap-alerting) - Display Common Alerting Protocol (CAP) emergency alerts on Screenly digital signage screens.
- [CharlieHR App](https://github.com/Screenly/charlie-hr-app/) - Displays employee birthdays, work anniversaries and other HR events from CharlieHR. _(Moved to a separate repository)_
- [Clock App](https://github.com/Screenly/clock-edge-app/) - A simple clock app. _(Moved to a separate repository)_
- [Countdown Timer](https://github.com/Screenly/Playground/tree/master/edge-apps/countdown-timer) - A simple countdown timer app.
- [Demo Dashboard](https://github.com/Screenly/demo-dashboard-app/) - A collection of demo dashboards. _(Moved to a separate repository)_
- [Flying Toasters App](https://github.com/Screenly/Playground/tree/master/edge-apps/flying-toasters) - A simple toaster app that flies around the screen.
- [Google Calendar App](https://github.com/Screenly/google-calendar-app/) - A simple calendar app that shows events from Google Calendar. _(Moved to a separate repository)_
- [Grafana Dashboard](https://github.com/Screenly/grafana-app/) - Displays Grafana dashboards as images on Screenly screens with automatic refresh intervals. _(Moved to a separate repository)_
- [iframe App](https://github.com/Screenly/Playground/tree/master/edge-apps/iframe) - A simple iframe app.
- [Menu Board App](https://github.com/Screenly/menu-board-app/) - A dynamic menu board that can display up to 25 menu items. _(Moved to a separate repository)_
- [Outlook Calendar App](https://github.com/Screenly/Playground/tree/master/edge-apps/outlook-calendar) - A simple calendar app that shows events from Outlook Calendar.
- [Power BI](https://github.com/Screenly/Playground/tree/master/edge-apps/powerbi) - A Power BI Edge App for securely accessing dashboards and reports.
- [QR Code Generator](https://github.com/Screenly/qr-code-app/) - A QR code generator app with customizable header and UTM tracking. _(Moved to a separate repository)_
- [RSS Reader](https://github.com/Screenly/rss-reader-app/) - A simple RSS reader. _(Moved to a separate repository)_
- [Simple Message App](https://github.com/Screenly/simple-message-app/) - A simple message app. _(Moved to a separate repository)_
- [Simple Table App](https://github.com/Screenly/Playground/tree/master/edge-apps/simple-table-app) - A minimalist edge app for Screenly that displays CSV data as a beautifully formatted table.
- [Simple Timer App](https://github.com/Screenly/simple-timer-app/) - A simple timer app. _(Moved to a separate repository)_
- [Sonar Dashboard](https://github.com/Screenly/Playground/tree/master/edge-apps/sonar-dashboard) - A dashboard that displays the status of the [Sonar - BLE Device Counter](https://github.com/Viktopia/sonar).
- [Strava Club Leaderboard](https://github.com/Screenly/strava-club-leaderboard-app/) - A leaderboard of Strava club activities. _(Moved to a separate repository)_
- [TFL Bus Status App](https://github.com/Screenly/Playground/tree/master/edge-apps/tfl-bus-status) - An app to display TFL Bus Status for a given bus stop. A list of all bus stops can be found here - [Bus Stop Lookup Tool](https://playground.srly.io/edge-apps/helpers/tfl/bus-stop-lookup/)
- [Weather App](https://github.com/Screenly/weather-app/) - A simple weather app. _(Moved to a separate repository)_
- [Welcome App](https://github.com/Screenly/welcome-app/) - A customizable welcome screen app. _(Moved to a separate repository)_

### Creating a New Edge App

To scaffold a new Edge App, run the following from the `edge-apps/` directory:

```bash
bun create edge-app-template --no-git <your-app-name>
```

This generates a new app with TypeScript, the Screenly design system, manifest files, and all standard scripts pre-configured. See [`edge-apps/README.md`](/edge-apps/README.md) for full details.

### TypeScript Library

The Playground also offers an Edge Apps library that contains utilities for building Edge Apps including helper functions.

Details on how to use the library can be found in the [`@screenly/edge-apps` package on NPM](https://www.npmjs.com/package/@screenly/edge-apps).

## Other

- [Bootstrap](https://github.com/Screenly/playground/tree/master/bootstrap/): A digital signage optimized Bootstrap theme for our Playground apps.
- [Dynamic Playlists](https://github.com/Screenly/playground/tree/master/dynamic-playlists/): An example of how to use Screenly's API to enable/disable a playlist based on weather conditions.
- [Instagram App](https://github.com/Screenly/playground/tree/master/instagram/): A basic Instagram app for Screenly.
- [JavaScript Injectors](https://github.com/Screenly/playground/tree/master/javascript-injectors/): Examples showing Screenly's JavaScript Injector.
- [Legacy Edge Apps Library](https://github.com/Screenly/playground/blob/master/docs/legacy-edge-apps-library.md): A deprecated Vue-centric library for building Edge Apps. This has been replaced by the [`@screenly/edge-apps` NPM package](https://www.npmjs.com/package/@screenly/edge-apps).
