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
- **Automatic token refresh**: Seamlessly renews expired Strava tokens without interruption
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
- **Refresh Token**: For long-term access (**required for automatic token renewal**)
- **Expires At**: Unix timestamp when the access token expires

**Important**: You need to go through the OAuth flow to get both access and refresh tokens. The tokens shown in your app settings page are limited and don't include refresh tokens.

### 3. Get OAuth Tokens (Recommended)

For automatic token refresh, you need to complete the OAuth flow:

1. **Get Authorization Code**: Visit this URL (replace YOUR_CLIENT_ID):
   ```
   https://www.strava.com/oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost/exchange_token&approval_prompt=force&scope=activity:read_all
   ```

2. **Authorize the app** and copy the `code` from the redirect URL

3. **Exchange for tokens** using curl (replace YOUR_CLIENT_ID, YOUR_CLIENT_SECRET, and AUTHORIZATION_CODE):
   ```bash
   curl -X POST https://www.strava.com/oauth/token \
     -F client_id=YOUR_CLIENT_ID \
     -F client_secret=YOUR_CLIENT_SECRET \
     -F code=AUTHORIZATION_CODE \
     -F grant_type=authorization_code
   ```

4. **Save the response** - you'll get:
   - `access_token`: Set this as your access_token
   - `refresh_token`: Set this as your refresh_token
   - `expires_at`: Automatically managed by the app (no need to configure)

### 4. Find Your Club ID

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

# Set your Strava Refresh Token (secure) - for automatic token renewal
screenly edge-app secret set refresh_token=YOUR_REFRESH_TOKEN

# Set your Strava Client Secret (secure) - required for token refresh
screenly edge-app secret set client_secret=YOUR_CLIENT_SECRET

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

## Automatic Token Management

The app includes robust token management to ensure uninterrupted operation:

- **Pure JavaScript management**: Token expiry is managed entirely in memory with no external dependencies
- **Proactive refresh**: Tokens are refreshed 5 minutes before expiry (when expiry is known)
- **Reactive handling**: If expiry time is unknown, handles token refresh automatically on 401 errors
- **Automatic retry**: If a request fails due to token expiry, the app automatically refreshes and retries
- **Zero configuration**: No need to set or manage expiry timestamps manually
- **Error recovery**: Clear error messages guide users to resolve authentication issues
- **No manual intervention**: Once configured, the app maintains itself without user interaction

This is particularly important for digital signage where the display may run unattended for weeks or months.

## API Rate Limits

The Strava API has rate limits:

- 200 requests per 15 minutes (increased from 100)
- 2,000 requests per day (increased from 1,000)

The app includes smart caching to minimize API calls:

- **Activities cached for 3 minutes**: Recent activity data with automatic expiration
- **Club details cached for 1 hour**: Club information that rarely changes
- **Automatic cache invalidation**: Cache is cleared on token refresh to prevent stale data
- **Quota management**: Handles localStorage limits with automatic cleanup
- **Health monitoring**: Tracks cache size and performance automatically
- **Efficient pagination**: Handles large clubs without hitting rate limits

## Troubleshooting

### Common Issues

**"Access token is required"**

- Ensure you've set the access token: `screenly edge-app secret set access_token=YOUR_TOKEN`
- Verify your token hasn't expired (check the browser console for expiry info)
- If using refresh tokens, ensure all OAuth credentials are properly set

**"Authentication failed" or Token Issues**

- **Missing refresh token**: Complete the OAuth flow to get both access and refresh tokens
- **Token expired**: The app will automatically refresh if you have a valid refresh_token and client_secret
- **Invalid client credentials**: Verify your client_id and client_secret match your Strava app
- **Token refresh failed**: Check the browser console for detailed error messages

**Checking Token Status**

Open the browser developer console and run:

**Token Management:**
```javascript
// Check overall token status and configuration (with detailed logging)
StravaApp.getTokenInfo()

// Show current token expiry details
StravaApp.showTokenExpiry()

// Test current token validity
StravaApp.probeToken()

// Manually refresh token (for testing)
StravaApp.refreshToken()
```

**Enhanced Debug Logging:**
The app now provides comprehensive console logging:
- 🔐 **Token validation**: Shows expiry times, refresh needs, and timing details
- 🔍 **Cache operations**: Shows which cache keys are being used for each operation
- ⏰ **Expiry tracking**: Displays exact expiry times in both UTC and local time
- 🎉 **Token refresh**: Detailed logs when tokens are refreshed with new expiry times
- 💾 **Cache storage**: Shows when data is cached and which keys are used

**Cache Management:**
```javascript
// Check cache statistics and health
StravaApp.getCacheStats()
StravaApp.checkCacheHealth()

// Perform intelligent cache cleanup with detailed reporting
StravaApp.cleanupCache()

// Clear all cache (forces fresh data on next load)
StravaApp.clearCache()

// Clear cache for specific club
StravaApp.clearCacheForClub('YOUR_CLUB_ID')

// Get current app state
StravaApp.getState()
```

The app automatically detects token expiry from API responses and manages cache intelligently, so you don't need to manually configure expiration times.

**Console Log Examples:**
```
🔐 Token validation check: {expiresAt: "2024-01-15T14:30:00Z", secondsUntilExpiry: 18234, ...}
🔍 Fetching club details: {clubId: "12345", cacheKey: "strava_club_details_12345"}
✅ Club details loaded from cache using key: strava_club_details_12345
⏰ Token will expire in: {minutes: 304, hours: 5, expiryTime: "1/15/2024, 2:30:00 PM"}
🎉 Access token refreshed successfully!
💾 Club activities page 1 cached for 10 minutes using key: strava_club_activities_12345_recent_1
```

**"Club ID is required"**

- Set your club ID: `screenly edge-app setting set club_id=YOUR_CLUB_ID`
- Ensure you're a member of the club

**"API rate limit exceeded"**

- The app will automatically retry after rate limits
- Cache reduces API calls - check cache health: `StravaApp.checkCacheHealth()`
- Consider reducing refresh frequency for very large clubs

**"No activities found"**

- Check that your club has recent activities
- Verify club members have public activities
- Clear cache and retry: `StravaApp.clearCache()`

**Performance Issues**

- Check cache statistics: `StravaApp.getCacheStats()`
- Monitor cache health: `StravaApp.checkCacheHealth()`
- Clear cache if it becomes too large: `StravaApp.clearCache()`

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
