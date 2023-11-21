# Square Menu Board Edge App

An edge app that automatically builds a menu board based on inventory in Square that allows you to select what inventory to be, Retrieve products and pricing 


```bash
$ cd edge-apps/squaremenuboard
$ screenly edge-app create \
    --name SquareMenuBoard \
    --in-place
$ screenly edge-app upload
[...]
$ screenly edge-app secret set square_api_token=MY_API_TOKEN
$ screenly edge-app version promote --latest
```
