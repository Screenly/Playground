# RSS Reader Edge App

![RSS Reader Edge App Preview](./static/img/rss-app-preview.png)

This Edge App displays articles from an RSS feed.
It uses [Alpine.js](https://alpinejs.dev/) for reactivity.

## Running the Edge App emulator

Before running the development server, run the following commands.
Doing so generates a file named `mock-data.yml`. Feel free to tweak the
YAML file as you see fit.

```bash
$ cd edge-apps/rss-reader
$ screenly edge-app generate-mock-data
# A file named `mock-data.yml` will be created if it doesn't exist yet.
```

Start the emulator:

```bash
$ screenly edge-app run
# You'll get the following console output:
Edge app emulator is running at http://127.0.0.1:40069/edge/1/index.html
```

The port number (e.g., `40069`) changes everytime you run the command.
Hit `Ctrl-C` to close the server.

## Uploading

```bash
$ screenly edge-app create \
    --name=my-rss-reader-app \
    --in-place
$ screenly edge-app deploy
```

Install the app

```bash
$ screenly edge-app instance create
Edge app instance successfully created.
```

Configure the feed:

```bash
$ screenly edge-app setting set rss_title=BBC
Edge app setting successfully set.

$ screenly edge-app setting set rss_url=http://feeds.bbci.co.uk/news/rss.xml
Edge app setting successfully set.
```

In some instances, you need to bypass the CORS policy in order to retrieve news. To do this, we can use the built-in [CORS bypass](https://developer.screenly.io/edge-apps/#cors) in Edge Apps by setting:

```bash
$ screenly edge-app setting set bypass_cors=true
Edge app setting successfully set.
```

Here's a table that contains a list of some RSS feed URLs, and whether the CORS proxy should be bypassed or not.

| URL                                                   | Requires CORS | bypass_cors |
| ----------------------------------------------------- | ------------- | ----------- |
| `http://feeds.bbci.co.uk/news/rss.xml`                | Yes           | true        |
| `https://lifehacker.com/rss`                          | Yes           | true        |
| `https://www.reddit.com/.rss`                         | Yes           | true        |
| `https://rss.nytimes.com/services/xml/rss/nyt/US.xml` | No            | false       |
| `http://rss.sciam.com/sciam/60secsciencepodcast`      | Yes           | true        |

## Tweaking the time and locale settings

### `override_timezone`

For instance, if you want to set the RSS feed update date and time as per the current date and time in London,

run the following command after setting the timer:

```bash
$ screenly edge-app setting set override_timezone='Europe/London'
# A relatively long console output...
Edge app setting successfully set.

$ screenly edge-app setting set override_locale='en-gb'
# A relatively long console output...
Edge app setting successfully set.
```

See [this page](https://momentjs.com/) for the list of all possible values for the time zone.
Alternatively, you can call `moment.locales()`, which returns all the supported locale values.

Setting invalid values for the timezone won't crash the app itself, it'll just fall back to the default time.
