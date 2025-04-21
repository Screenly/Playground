# Google Calendar Edge App (Vanilla JS Version)

A vanilla JavaScript implementation of the Google Calendar Edge App for Screenly.

## Overview

This app displays your Google Calendar events in a beautiful, easy-to-read format. It shows:

- A monthly calendar view
- Today's date and current time
- Upcoming events for the next 24 hours
- Screenly branding

## Features

- Real-time clock display
- Monthly calendar view with current day highlighted
- Display of upcoming calendar events
- Responsive design that works on various screen sizes
- Dark mode support
- Google Calendar API integration

## Configuration

The app requires the following settings in the `screenly.yml` file:

- `refresh_token`: Google OAuth Refresh Token
- `client_id`: Google OAuth Client ID
- `client_secret`: Google OAuth Client Secret
- `calendar_id`: Google Calendar ID (defaults to 'primary')
- `calendar_mode`: Calendar display mode (monthly, weekly, daily)
- `theme`: Visual theme (light or dark)

## Development

This app is built with vanilla JavaScript, HTML, and CSS. No build process is required.

### File Structure

```
google-calendar-2/
├── index.html              # Main HTML file
├── screenly.yml            # App configuration
├── static/
│   ├── js/
│   │   └── main.js         # All JavaScript logic
│   ├── styles/
│   │   └── main.css        # Styles
│   ├── fonts/              # Font files
│   └── img/                # Images
└── README.md               # This file
```

## License

Copyright © 2023 Screenly, Inc. All rights reserved.
