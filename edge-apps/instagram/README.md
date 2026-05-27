# Instagram Edge App

An edge app that uses a Meta token to fetch the latest two posts from an Instagram account

```bash
$ cd edge-apps/instagram
$ screenly edge-app create \
    --name Instagram \
    --in-place
$ screenly edge-app deploy
[...]
# To install an app, you need to create an instance.
$ screenly edge-app instance create
$ screenly edge-app secret set instagram_api_token=MY_META_TOKEN
```
