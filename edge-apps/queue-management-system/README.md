# Queue Management System (Proof of Concept)

This is a proof-of-concept queue management system for retail environments that helps direct customers to available tills. **Note: This is not intended for production use.**

## Architecture

![Architecture Diagram](architecture.svg)

The system consists of three main components:

1. **Call-Forward Screen**: A display that shows available tills to customers running as a Screenly Edge App
2. **Point of Sale (POS)**: The till system that marks tills as busy/available
3. **Queue API**: Backend service that manages the till states using Redis for persistence

## API Endpoints

### Display Status

Get the current status of all tills:

```http
GET /display

Response (some tills available):
{
    "available_tills": ["2", "4"],
    "busy_tills": ["1", "3"]
}

Response (no tills available):
{
    "available_tills": [],
    "busy_tills": ["1", "2", "3", "4"]
}
```

### Update Till Status

Mark a till as available:

```http
POST /till/{till_id}/available

Response:
{
    "till_id": "1",
    "status": "available",
    "is_available": true
}
```

Mark a till as busy:

```http
POST /till/{till_id}/busy

Response:
{
    "till_id": "1",
    "status": "busy",
    "is_available": false
}
```

## Client Display

With the [Screenly CLI](https://github.com/screenly/cli) installed and the server running, do the following:

```bash
cd client
screenly edge-app run
```

The client is configured through Screenly settings in `screenly.yml`:

- `api_url`: The URL of the queue management API server (default: http://localhost:8000)
- `poll_interval`: How often to check for updates in milliseconds (default: 5000)

## Development

This is a Docker Compose based application. To run it locally:

- Make sure you have Docker and Docker Compose installed
- Navigate to the server directory:

```bash
cd edge-apps/queue-management-system/server
```

- Run the application:

```bash
docker compose up
```

The application will be available at:

- Client: `http://localhost:8000/`
- API: `http://localhost:8000/display`

### Configuration

The server can be configured through environment variables in `docker-compose.yml`:

- `TILLS`: Comma-separated list of till IDs (default: "1,2,3,4")
- `REDIS_HOST`: Redis server hostname (default: "redis")
- `REDIS_PORT`: Redis server port (default: 6379)

## Integration with Screenly

The display client integrates with Screenly by:

1. Using the Screenly JS API for screen identification
2. Utilizing Screenly's branding colors through CSS variables
3. Displaying the screen name from `screenly.metadata.screen_name`
4. Configurable through Screenly settings

## Features

- Persistent storage using Redis for till states
- Configurable number of tills through environment variables
- Real-time updates with configurable polling interval
- CORS support for cross-origin requests

## Limitations

This is a proof-of-concept implementation with several limitations:

- Limited error handling
- No production-ready logging
- No health checks or monitoring
- No authentication or security measures

For a production implementation, these limitations would need to be addressed along with proper testing and security measures.
