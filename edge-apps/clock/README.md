# Screenly Clock App

## tl;dr

```bash
$ cd edge-apps/clock
$ screenly edge-app create \
    --name my-clock-app \
    --in-place
$ screenly edge-app upload
[...] # You can tweak settings here.
$ screenly edge-app version promote --revision=X

# Alternatively, you can use --latest in place of --revision.
```

## Tweaking the settings

### `override_timezone`

For instance, if you want to clock app to display the current date and time in London,
run the following command:

```bash
$ screenly edge-app setting set override_timezone='Europe/London'
```

See [this page](https://www.ibm.com/docs/en/cloudpakw3700/2.3.0.0?topic=SS6PD2_2.3.0/doc/psapsys_restapi/time_zone_list.htm)
for the list of all possible values for the time zone.

Setting invalid values for the timezone won't crash the app itself, it'll just fall back to the default time.
