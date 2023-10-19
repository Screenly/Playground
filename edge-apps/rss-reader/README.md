# RSS Reader Edge App

This Edge App displays articles from an RSS feed.
It's uses [Alpine.js](https://alpinejs.dev/) for reactivity.

## Dependencies

The RSS reader app depends on [Screenly's Playground Theme](https://github.com/Screenly/Playground/tree/master/bootstrap),
so you need to copy the necessary files first. To do so, run the following commands.

```bash
$ cd edge-apps/rss-reader
$ mkdir -p bootstrap/theme
$ cp -r ../../bootstrap/theme/ ./bootstrap/
```

## Running the Edge App emulator

Before running the development server, run the following commands.
Doing so generates a file named `mock-data.yml`. Feel free to tweak the
YAML file as you see fit.

```bash
$ cd edge-apps/rss-reader
$ screenly edge-app generate-mock-data
```

Start the emulator:

```bash
$ screenly edge-app run
```

You'll get the following console output:

```bash
Edge app emulator is running at http://127.0.0.1:40069/edge/1/index.html
```

The port number (e.g., `40069`) changes everytime you run the command.
Hit `Ctrl-C` to close the server.

## Uploading

The RSS reader app depends on [Screenly's Playground Theme](https://github.com/Screenly/Playground/tree/master/bootstrap),
so you need to copy the necessary files first. To do so, run the following commands.

```bash
$ screenly edge-app create \
    --name=my-rss-reader-app \
    --in-place
$ screenly edge-app upload
```

Configure the feed:

```bash
$ screenly edge-app setting set rss_title=BBC
$ screenly edge-app setting set rss_url=http://feeds.bbci.co.uk/news/rss.xml
```

In some instances, you need to bypass the CORS policy in order to retrieve news. To do this, we can use the built-in [CORS bypass](https://developer.screenly.io/edge-apps/#cors) in Edge Apps by setting:

```bash
$ screenly edge-app setting set bypass_cors=true
```

Here's a table that contains a list of some RSS feed URLs, and whether the CORS proxy should be bypassed or not.

| URL                                                 | Requires CORS | bypass_cors |
| --------------------------------------------------- | ------------- | ----------- |
| http://feeds.bbci.co.uk/news/rss.xml                | Yes           | true        |
| https://lifehacker.com/rss                          | Yes           | true        |
| https://www.reddit.com/.rss                         | Yes           | true        |
| https://rss.nytimes.com/services/xml/rss/nyt/US.xml | No            | false       |
| http://rss.sciam.com/sciam/60secsciencepodcast      | Yes           | true        |
