import os
from sys import exit

import requests
from furl import furl

# Grafana API Key
GRAFANA_API_KEY = os.getenv("GRAFANA_API_KEY", False)

# Get Screenly API token
SCREENLY_API_TOKEN = os.getenv("SCREENLY_API_TOKEN", False)


def massage_grafana_url(url):
    parsed = furl(url)

    # Remove 'Refresh' key from query string
    try:
        del parsed.args["refresh"]
    except KeyError:
        pass

    # Add 'kiosk' key from query string to remove menu bar and header
    parsed.args["kiosk"] = "1"

    return parsed.url


def add_asset_to_screenly(url, input_name):
    headers = {
        "Authorization": f"Token {SCREENLY_API_TOKEN}",
        "Content-Type": "application/json",
    }

    response = requests.request(
        method="POST",
        url="https://api.screenlyapp.com/api/v3/assets/",
        json={
            "source_url": f"{url}",
            "folder_name": "Grafana",
            "title": f"{input_name}",
            "headers": {"Authorization": f"Bearer {GRAFANA_API_KEY}"},
        },
        headers=headers,
    )

    if response.ok:
        print("Asset added successfully")
    else:
        print(f"Error adding asset: {response.status_code} {response.reason}")


def main():
    if not GRAFANA_API_KEY:
        print("GRAFANA_API_KEY environment variable is missing.")
    if not SCREENLY_API_TOKEN:
        print("SCREENLY_API_TOKEN environment variable is missing")

    if not SCREENLY_API_TOKEN or not GRAFANA_API_KEY:
        exit(1)
    input_url = input("Enter Grafana URL: ")
    input_name = input("Enter dashboard name: ")
    url = massage_grafana_url(input_url)

    print(f"Adding url: {url}")
    add_asset_to_screenly(url, input_name)


if __name__ == "__main__":
    main()
