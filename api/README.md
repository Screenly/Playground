### Summary

This example shows how, having a screen, attach to it a newly created asset with js injection.
Here are some examples and tips on writing a proper js injection code: * [Js Injection](../javascript-injectors/README.md)

For this you would need an API token(Can be found on web dashboard /manage/account/team)
And a paired screen id: it can be found either from the API or retrieving from web dashboard screen url:
https://yourteam.screenlyapp.com/manage/screens/01FAZMW8E0CB2AM78N63QP406Y
'01FAZMW8E0CB2AM78N63QP406Y' - this is screen_id.


#### Code example

```python

import requests
from time import sleep

TOKEN = '<API TOKEN>'
SCREEN_ID = '<Screen id>'

HEADERS = {
    "Authorization": f"Token {TOKEN}",
    "Content-Type": "application/json"
}


def create_group(name):
    response = requests.post(
        url='https://api.screenlyapp.com/api/v3/groups/',
        json={
            'name': name,
            'screens': [{
                'id': SCREEN_ID
            }]
        },
        headers=HEADERS
    )
    group_id = response.json()['id']
    print(f"Group created: {group_id}")
    return group_id


def create_playlist(group_id, asset_id, title):
    response = requests.post(
        url='https://api.screenlyapp.com/api/v3/playlists/',
        json={
            'title': title,
            'groups': [{'id': group_id}],
            'assets': [{'id': asset_id, 'duration': 4}],
        },
        headers=HEADERS
    )
    playlist_id = response.json()['id']
    print(f"Playlist created: {playlist_id}")
    return playlist_id


def create_asset(url, js_code, title):
    response = requests.post(
        'https://api.screenlyapp.com/api/v3/assets/',
        json={
            'title': title,
            'js_injection': js_code,
            'source_url': url
        },
        headers=HEADERS
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
        f'https://api.screenlyapp.com/api/v3/assets/{asset_id}/',
        headers=HEADERS
    )
    return response.json()['status']


def update_screen(group_id):
    screen_json = requests.get(
        f'https://api.screenlyapp.com/api/v3/screens/{SCREEN_ID}/',
        headers=HEADERS
    ).json()

    screen_json['groups'].append({'id': group_id})

    requests.put(
        f'https://api.screenlyapp.com/api/v3/screens/{SCREEN_ID}/',
        json=screen_json,
        headers=HEADERS
    )


def main():
    # This js injection will be applied when page is shown on the device.
    JS_CODE = """
    document.getElementById("hello-world").textContent = 'New Text';
    """
    SOURCE_URL = 'https://screenly.github.io/screenly-playground.github.io/'

    # Create a new web assets and attach js_injection
    # It uses SOURCE_URL above - the web page hosted by github pages
    # You can use your own page if needed.
    asset_id = create_asset(SOURCE_URL, JS_CODE, "My web asset")

    # For asset to be associated with the screen we need to label playlist and screen with same group.
    group_id = create_group("My Js injection Group")

    # Wait for asset to process on server
    # It can't be added to playlist before that
    wait_asset_processed(asset_id)

    create_playlist(group_id, asset_id, "My Js Injection Playlist")
    update_screen(group_id)


if __name__ == '__main__':
    main()

```
