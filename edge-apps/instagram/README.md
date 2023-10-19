# Instagram Edge App

An edge app that uses a Meta token to fetch the latest two posts from an Instagram account

```bash
$ cd edge-apps/instagram
$ screenly edge-app create \
    --name Instagram \
    --in-place
$ screenly edge-app upload
[...]
$ screenly edge-app secret set instagram_api_token=MY_META_TOKEN
$ screenly edge-app version promote --latest
```
