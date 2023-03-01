import requests
from sys import exit
from furl import furl
import os

# Grafana API Key
GRAFANA_API_KEY = os.getenv('GRAFANA_API_KEY', False)

# Get Screenly API token
SCREENLY_API_TOKEN = os.getenv('SCREENLY_API_TOKEN', False)

def massage_grafana_url(url):
    parsed = furl(url)

    # Remove 'Refresh' key from query string
    try:
        del parsed.args['refresh']
    except KeyError:
        pass

    # Add 'kiosk' key from query string to remove menu bar and header
    parsed.args['kiosk'] = '1'

    return parsed.url


def add_asset_to_screenly(url, input_name):
    headers = {
        "Authorization": f"Token {SCREENLY_API_TOKEN}",
        "Content-Type": "application/json"
    }

    response = requests.request(
        method='POST',
        url='https://api.screenlyapp.com/api/v3/assets/',
        json={
            'source_url': f"{url}",
            'folder_name': 'Grafana',
            'title': f"{input_name}",
            'headers': {
                'Authorization': f"Bearer {GRAFANA_API_KEY}"
            }
        },
        headers=headers
    )

    if response.ok:
        print('Asset added successfully')
    else:
        print(f'Error adding asset: {response.status_code} {response.reason}')

def main():
    for key in [GRAFANA_API_KEY, SCREENLY_API_TOKEN]:
        if not key:
            print('Missing environment variable')
            exit(1)

    input_url = input("Enter Grafana URL: ")
    input_name = input("Enter dashboard name: ")
    url = massage_grafana_url(input_url)

    print(f'Adding url: {url}')
    add_asset_to_screenly(url, input_name)

if __name__ == "__main__":
    main()
