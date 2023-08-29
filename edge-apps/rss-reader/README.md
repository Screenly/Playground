# RSS Reader Edge App

This Edge App displays articles from an RSS feed.

## Uploading

The RSS reader app depends on [Screenly's Playground Theme](https://github.com/Screenly/Playground/tree/master/bootstrap),
so you need to copy the necessary files first. To do so, run the following commands.

```bash
$ cd edge-apps/rss-reader
$ mkdir -p bootstrap/theme
$ cp -r ../../bootstrap/theme/ ./bootstrap/
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