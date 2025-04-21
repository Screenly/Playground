# Queue Management System (Proof of Concept)

This is a proof-of-concept queue management system for retail environments that helps direct customers to available tills. **Note: This is not intended for production use.**

## Architecture

![Architecture Diagram](architecture.svg)

The system consists of three main components:

1. **Call-Forward Screen**: A display that shows available tills to customers
2. **Point of Sale (POS)**: The till system that marks tills as busy/available
3. **Queue API**: Backend service that manages the till states

## API Endpoints

### Display Status

Get the current status of all tills:

```
GET /display

Response:
{
    "available_tills": ["2", "4"],
    "busy_tills": ["1", "3"]
}
```

### Update Till Status

Mark a till as available:

```
POST /till/{till_id}/available

Response:
{
    "till_id": "1",
    "status": "available",
    "is_available": true
}
```

Mark a till as busy:

```
POST /till/{till_id}/busy

Response:
{
    "till_id": "1",
    "status": "busy",
    "is_available": false
}
```

## Client Display

The client display is a web application that shows available tills to customers. It:

- Polls the `/display` endpoint every 5 seconds
- Shows only available tills with green indicators
- Displays the screen name in the bottom right corner
- Uses Screenly's branding colors when available

## Development

This is a Docker Compose based application. To run it locally:

1. Make sure you have Docker and Docker Compose installed
2. Navigate to the server directory:

```bash
cd edge-apps/queue-management-system/server
```

3. Run the application:

```bash
docker compose up
```

The application will be available at:

- Client: `http://localhost:8000/`
- API: `http://localhost:8000/display`

## Integration with Screenly

The display client integrates with Screenly by:

1. Using the Screenly JS API for screen identification
2. Utilizing Screenly's branding colors through CSS variables
3. Displaying the screen name from `screenly.metadata.screen_name`

## Limitations

This is a proof-of-concept implementation with several limitations:

- No persistent storage (till states are lost on restart)
- No authentication or security measures
- Limited error handling
- No production-ready logging
- No health checks or monitoring

For a production implementation, these limitations would need to be addressed along with proper testing and security measures.
