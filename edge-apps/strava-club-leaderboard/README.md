# Strava Club Leaderboard Edge App

A beautiful, real-time leaderboard for Strava clubs that displays member rankings based on weekly or monthly activity data. Perfect for motivating team members and displaying club achievements on digital signage.

![Strava Club Leaderboard](static/images/icon.svg)

## Features

- **Real-time leaderboard**: Displays club members ranked by total distance
- **Flexible time periods**: Weekly or monthly leaderboards
- **Comprehensive statistics**: Shows distance, time, elevation, and activity count
- **Modern design**: Clean, responsive interface with smooth animations
- **Customizable**: Configurable athlete count, themes, and display options
- **Auto-refresh**: Updates every 5 minutes automatically
- **Caching**: Efficient data caching to reduce API calls
- **Error handling**: Graceful error states with helpful messages
- **Responsive**: Adapts to different screen sizes and resolutions

## Prerequisites

- Screenly CLI installed ([installation guide](https://github.com/Screenly/cli))
- Strava API access (free Strava account required)
- Access to a Strava club (as member or admin)

## Strava API Setup

### 1. Create a Strava App

1. Go to [Strava API Settings](https://www.strava.com/settings/api)
2. Click "Create App" if you don't have one
3. Fill in the application details:
   - **Application Name**: Your app name (e.g., "Club Leaderboard")
   - **Category**: Choose "Visualizer"
   - **Club**: Select your club
   - **Website**: Your Site or Screenly Playground URL
   - **Authorization Callback Domain**: `localhost` (for testing)

### 2. Get Your API Credentials

After creating the app, you'll see:

- **Client ID**: A numeric ID (e.g., 168413)
- **Client Secret**: A secret string (keep this private)
- **Access Token**: Your personal access token
- **Refresh Token**: For long-term access (optional)

### 3. Find Your Club ID

1. Go to your Strava club page
2. The URL will look like: `https://www.strava.com/clubs/YOUR_CLUB_ID`
3. Copy the club ID from the URL

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Screenly/Playground.git
cd Playground/edge-apps/strava-club-leaderboard
```

### 2. Login to Screenly

```bash
screenly login
```

### 3. Create the Edge App

```bash
screenly edge-app create \
    --name "Strava Club Leaderboard" \
    --in-place
```

### 4. Deploy the App

```bash
screenly edge-app deploy
```

### 5. Create an Instance

```bash
screenly edge-app instance create
```

## Configuration

### Required Settings

Set your Strava API credentials:

```bash
# Set your Strava Client ID
screenly edge-app setting set client_id=YOUR_CLIENT_ID

# Set your Strava Client Secret (secure)
screenly edge-app secret set client_secret=YOUR_CLIENT_SECRET

# Set your Strava Access Token (secure)
screenly edge-app secret set access_token=YOUR_ACCESS_TOKEN

# Set your Club ID
screenly edge-app setting set club_id=YOUR_CLUB_ID
```

### Optional Settings

Customize your leaderboard:

```bash
# Set leaderboard duration (week or month)
screenly edge-app setting set leaderboard_duration=week

# Set maximum number of athletes to display (1-50)
screenly edge-app setting set max_athletes=10

# Set visual theme (light or dark)
screenly edge-app setting set theme=light
```

## Usage

### Viewing the Leaderboard

1. Open your Screenly dashboard
2. Navigate to Assets
3. Find your "Strava Club Leaderboard" app
4. Add it to a playlist
5. Assign the playlist to your device

### Leaderboard Features

- **Rankings**: Athletes ranked by total distance in the selected time period
- **Statistics**: Each athlete shows:
  - Total distance covered
  - Total time spent
  - Total elevation gained
  - Average distance per activity
  - Number of activities
- **Visual Indicators**:
  - Top 3 athletes get special highlighting
  - Medal icons for podium positions
  - Gradient backgrounds for top performers
- **Auto-refresh**: Updates every 5 minutes
- **Time Period**: Shows "This Week" or "This Month" based on settings

### Supported Screen Resolutions

The app is optimized for all Screenly-supported resolutions:

- 4K displays (3840x2160)
- Full HD (1920x1080)
- HD (1280x720)
- Standard (1024x768)
- Portrait orientations
- Mobile screens (480px and below)

## API Rate Limits

The Strava API has rate limits:

- 100 requests per 15 minutes
- 1,000 requests per day

The app includes smart caching to minimize API calls:

- Activities are cached for 3 minutes
- Automatic pagination handles large clubs
- Efficient data processing reduces redundant requests

## Troubleshooting

### Common Issues

**"Access token is required"**

- Ensure you've set the access token: `screenly edge-app secret set access_token=YOUR_TOKEN`
- Verify your token hasn't expired

**"Club ID is required"**

- Set your club ID: `screenly edge-app setting set club_id=YOUR_CLUB_ID`
- Ensure you're a member of the club

**"API rate limit exceeded"**

- The app will automatically retry after rate limits
- Consider reducing refresh frequency for very large clubs

**"No activities found"**

- Check that your club has recent activities
- Verify the time period setting (week/month)
- Ensure club members have public activities

### Getting Help

1. Check the browser console for error messages
2. Verify all settings are correctly configured
3. Test your Strava API credentials independently
4. Contact Screenly support if issues persist

## API Reference

### Strava API Endpoints Used

- `GET /api/v3/clubs/{id}/activities` - Fetch club activities
- Requires `read` scope on access token
- Supports pagination for large result sets

### Settings Reference

| Setting                | Type   | Required | Default | Description                        |
| ---------------------- | ------ | -------- | ------- | ---------------------------------- |
| `client_id`            | String | Yes      | -       | Strava API Client ID               |
| `client_secret`        | Secret | Yes      | -       | Strava API Client Secret           |
| `access_token`         | Secret | Yes      | -       | Strava API Access Token            |
| `club_id`              | String | Yes      | -       | Strava Club ID                     |
| `leaderboard_duration` | String | No       | `week`  | Time period: `week` or `month`     |
| `max_athletes`         | String | No       | `10`    | Maximum athletes to display (1-50) |
| `theme`                | String | No       | `light` | Visual theme: `light` or `dark`    |

| `screenly_color_accent` | String | No | `#FC4C02` | Brand primary color (hex format) |
| `screenly_color_light` | String | No | `#adafbe` | Brand light theme color (hex format) |
| `screenly_color_dark` | String | No | `#adafbe` | Brand dark theme color (hex format) |
| `screenly_logo_light` | String | No | - | Brand logo URL for light theme |
| `screenly_logo_dark` | String | No | - | Brand logo URL for dark theme |

## Development

### Local Development

1. Install dependencies (if any)
2. Configure environment variables
3. Open `index.html` in a browser
4. Use browser dev tools for debugging

### File Structure

```bash
strava-club-leaderboard/
├── index.html              # Main HTML file
├── screenly.yml            # Edge App configuration
├── README.md              # This file
└── static/
    ├── css/
    │   ├── common.css     # Common styles and variables
    │   └── style.css      # App-specific styles
    ├── js/
    │   └── main.js        # Main application logic
    └── images/
        ├── icon.svg       # App icon
        ├── strava.svg # Strava logo
        └── screenly.svg # Screenly logo
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Screenly Playground and follows the same license terms.

## Support

For issues or questions:

- Check the [Screenly documentation](https://developer.screenly.io/edge-apps)
- Visit the [Strava API documentation](https://developers.strava.com/docs)
- Contact Screenly support
- Open an issue in the repository

---

**Note**: This app requires a Strava account and API access. Ensure you comply with Strava's API terms of service and rate limits.
