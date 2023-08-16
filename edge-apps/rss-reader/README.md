# RSS Reader Edge App

This Edge App displays articles from an RSS feed.

## Uploading

The RSS reader app depends on [Screenly's Playground Theme](https://github.com/Screenly/Playground/tree/master/bootstrap),
so you need to copy the necessary files first. To do so, run the following commands.

```bash
# Assuming that you're inside `./edge-apps/rss-reader`
mkdir -p bootstrap/theme
cp -r ../../bootstrap/theme ./bootstrap/theme
screenly edge-app upload
```

Take note that `edge-apps/rss-reader/bootstrap` is included in `.gitignore`, so it'll just ignore them when doing
`git status` for example.
