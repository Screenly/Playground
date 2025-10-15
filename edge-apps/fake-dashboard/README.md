# Fake Dashboard App
![Sonar Dashboard](static/img/fake-dashboard-preview.webp)

A Simple digital signage dashboard that displays simulated website analytics, including live visitor count, traffic sources, and device usage.

# Key Highlights

- Real-time simulated visitor count
- Device and traffic source breakdowns
- Page view trends with animated 12-month history
- Fully responsive design from 480px to 4K screens
- Built with vanilla JS and Chart.js for speed and simplicity
- No setup required—just install and display

## Installation

```bash
$ cd edge-apps/fake-dashboard
$ screenly edge-app create \
    --name fake-dashboard \
    --in-place
$ screenly edge-app deploy
[...] # You can tweak settings here.
# To install an app, you need to create an instance.
$ screenly edge-app instance create

# Alternatively, you can use --latest in place of --revision.
```

For More Details, Please check [Fake Dashboard Edge App Page](https://www.screenly.io/edge-apps/fake-dashboard/). 


