# Add Grafana Asset

A simple Python script to make Grafana dashboards more Screenly friendly.

The script assumes that you have a Screenly account, as well as a content group called 'Grafana'.

## Installation

```console
$ pip install -r requirements.txt
```

## Usage

Set your API tokens:
```console
$ export GRAFANA_API_TOKEN=<your token>
$ export SCREENLY_API_TOKEN<your token>
```


```console
$ ./python add-grafana-asset.py
Enter Grafana URL: https://grafana.example.org/d/abc123/foobar?orgId=1&refresh=30s
Enter dashboard name: My Dashboard

Adding url: https://grafana.example.org/d/abc123/foobar?orgId=1&kiosk=1
[...]
```