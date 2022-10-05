import requests
import os
from time import sleep


SCREEN_ID = os.getenv('SCREEN_ID')
TOKEN = os.getenv('TOKEN')
HEADERS = {
    "Authorization": f"Token {TOKEN}",
    "Content-Type": "application/json"
}
HOST = 'https://api.screenlyapp.com'


def create_group(screen_id, name):
    response = requests.post(
        url=f'{HOST}/api/v3/groups/',
        json={
            'name': name,
            'screens': [{
                'id': screen_id
            }]
        },
        headers=HEADERS,
    )
    group_id = response.json()['id']
    print(f"Group created: {group_id}")
    return group_id


def create_playlist(group_id, asset_id, title):
    response = requests.post(
        url=f'{HOST}/api/v3/playlists/',
        json={
            'title': title,
            'groups': [{'id': group_id}],
            'assets': [{'id': asset_id, 'duration': 4}],
        },
        headers=HEADERS,
    )
    playlist_id = response.json()['id']
    print(f"Playlist created: {playlist_id}")
    return playlist_id


def create_asset(url, js_code, title):
    response = requests.post(
        f'{HOST}/api/v3/assets/',
        json={
            'title': title,
            'js_injection': js_code,
            'source_url': url
        },
        headers=HEADERS,
    )
    asset_id = response.json()['id']
    print(f"Asset created: {asset_id}")
    return asset_id


def wait_asset_processed(asset_id):
    for i in range(1, 4):
        sleep(i ** 2)
        status = get_asset_status(asset_id)
        if status == 'finished':
            break
        if status == 'error':
            raise

    print(f"Asset is processed: {asset_id}")


def get_asset_status(asset_id):
    response = requests.get(
        f'{HOST}/api/v3/assets/{asset_id}/',
        headers=HEADERS,
    )
    return response.json()['status']


def main():
    # This js injection will be applied when page is shown on the device.
    JS_CODE = """
    document.getElementById("hello-world").textContent = 'New Text';
    """
    SOURCE_URL = 'https://screenly.github.io/screenly-playground.github.io/'

    # Create a new web asset and attach js_injection
    # It uses SOURCE_URL above - the web page hosted by GitHub pages
    # You can use your page if needed.
    asset_id = create_asset(SOURCE_URL, JS_CODE, "My web asset")

    # For an asset to be associated with the screen we need to label the playlist and screen with the same group.
    group_id = create_group(SCREEN_ID, "My Js injection Group")

    # Wait for an asset to process on the server
    # It can't be added to the playlist before that
    wait_asset_processed(asset_id)

    create_playlist(group_id, asset_id, "My Js Injection Playlist")


if __name__ == '__main__':
    main()
