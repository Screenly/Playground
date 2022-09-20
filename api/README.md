### Summary

This example shows how, having a screen, attach to it a newly created asset with js injection.

For this, you would need
 - an API token, which can be found on the web dashboard /manage/account/team.
 - a paired screen id, which can be found either from the API or retrieved from the web dashboard screen URL:

https://yourteam.screenlyapp.com/manage/screens/01FAZMW8E0CB2AM78N63QP406Y

'01FAZMW8E0CB2AM78N63QP406Y' - this is screen_id.

Both are passed as environment variables.
`TOKEN=<your_token> SCREEN_ID=<screen_id> python your_script.py`


#### Code example
First, prepare headers for the API. Screenly uses Header token authorization

```python
import os
TOKEN = os.getenv('TOKEN')

HEADERS = {
    "Authorization": f"Token {TOKEN}",
    "Content-Type": "application/json"
}
```

Then, let's create a web asset we want to show on the screen.
Web asset also will have a js injection - js code, that will run once the page is loaded.
Here are some examples and tips on writing a proper JS injection code: * [Js Injection](../javascript-injectors/README.md)

```python
import requests


# This js injection will be applied when page is shown on the device.
JS_CODE = """
document.getElementById("hello-world").textContent = 'New Text';
"""
SOURCE_URL = 'https://screenly.github.io/screenly-playground.github.io/'

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

# Create a new web asset and attach js_injection.
# It uses SOURCE_URL above - the web page hosted by GitHub pages.
# You can use your page if needed.
create_asset(SOURCE_URL, JS_CODE, 'My new Asset')
```

After that, you would need to create a group.
Group is used to determine what playlists are applied to the screen.

```python
SCREEN_ID = os.getenv('SCREEN_ID')

def create_group(screen_id, name):
    response = requests.post(
        url='https://api.screenlyapp.com/api/v3/groups/',
        json={
            'name': name,
            'screens': [{
                'id': screen_id
            }]
        },
        headers=HEADERS
    )
    group_id = response.json()['id']
    print(f"Group created: {group_id}")
    return group_id

# For an asset to be associated with the screen we need to label the playlist and screen with the same group.
group_id = create_group(SCREEN_ID, "My Js injection Group")
```

Before creating a playlist we need to ensure web asset is processed.
Until it is, it can be shown on the screen, and usually, it takes several seconds.
Here is a simple wait loop for these purposes.

```python
from time import sleep


def get_asset_status(asset_id):
    response = requests.get(
        f'https://api.screenlyapp.com/api/v3/assets/{asset_id}/',
        headers=HEADERS
    )
    return response.json()['status']

def wait_asset_processed(asset_id):
    for i in range(1, 4):
        sleep(i ** 2)
        status = get_asset_status(asset_id)
        if status == 'finished':
            break
        if status == 'error':
            raise

    print(f"Asset is processed: {asset_id}")

wait_asset_processed(asset_id)
```

Then create a playlist, that will be applied to the screen with the group above.

```python
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

create_playlist(group_id, asset_id, "My Js Injection Playlist")
```

And the last thing, the screen should be updated with the created group to be targeted by playlist.

```python
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

update_screen(group_id)
```

Full code example is here: [Code Example](./web_asset_js_injection.py)
