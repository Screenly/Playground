# Indoor Sensor Dashboard Edge App

This Edge App provides a real-time dashboard for monitoring indoor environmental metrics such as Temperature, Humidity, VOC (Volatile Organic Compounds), and eCO₂, using data from a Prometheus endpoint. The dashboard is fully responsive and designed to work across a wide range of screen resolutions, including 4K, 1080p, 720p, and Raspberry Pi touch displays.

## Features
- Real-time display of indoor sensor metrics (Temperature, Humidity, VOC, eCO₂)
- Configurable Prometheus endpoint and metric IDs
- Responsive design for landscape and portrait orientations
- Clean, modern UI inspired by professional dashboards

## Settings
The following settings are available in the Edge App manifest (`screenly.yml`):

| Setting                  | Type    | Default Value                                 | Description                                                                 |
|--------------------------|---------|-----------------------------------------------|-----------------------------------------------------------------------------|
| `prometheus_endpoint`    | string  | *(none)*                                      | **Required.** URL to the Prometheus metrics endpoint (e.g., `http://192.168.3.80/metrics`). |
| `temperature_metric_id`  | string  | `airing_cabinet_temperature`                  | Metric ID for temperature.                                                  |
| `humidity_metric_id`     | string  | `airing_cabinet_humidity`                     | Metric ID for humidity.                                                     |
| `voc_metric_id`          | string  | `airing_cabinet_total_volatile_organic_compound` | Metric ID for VOC (Volatile Organic Compounds).                             |
| `eco2_metric_id`         | string  | `airing_cabinet_eco2_value`                   | Metric ID for eCO₂.                                                         |

## Usage
1. **Configure the App:**
   - Set the `prometheus_endpoint` to the URL of your Prometheus metrics endpoint.
   - Optionally, adjust the metric IDs if your Prometheus data uses different names.
2. **Deploy the App:**
   - Use the Screenly CLI or web dashboard to deploy and schedule the Edge App.
3. **View the Dashboard:**
   - The dashboard will automatically fetch and display the latest sensor values in real time.

## Responsive Design
This app is designed to support the following resolutions (and more):
- 4096 × 2160 (4K landscape)
- 2160 × 4096 (4K portrait)
- 3840 × 2160 (4K landscape)
- 2160 × 3840 (4K portrait)
- 1920 × 1080 (1080p landscape)
- 1080 × 1920 (1080p portrait)
- 1280 × 720 (720p landscape)
- 720 × 1280 (720p portrait)
- 800 × 480 (Raspberry Pi Touch Display landscape)
- 480 × 800 (Raspberry Pi Touch Display portrait)

For more details, see the [Screenly Playground Supported Resolutions](https://raw.githubusercontent.com/Screenly/Playground/refs/heads/master/docs/resolutions.md).

## Documentation
- [Screenly Edge App Developer Documentation](https://developer.screenly.io/edge-apps/#edge-apps)

## Live Coding Session
This Edge App was created as part of a live coding session. Watch the session here:

[Live Coding Session on YouTube](https://www.youtube.com/watch?v=TGu8MwtWwnc)