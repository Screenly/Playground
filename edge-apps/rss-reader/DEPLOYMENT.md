# Custom RSS Reader Deployment Guide

Deploy multiple custom RSS reader apps from a single template using GitHub Actions.

## Workflows

### Initialize Custom RSS Reader App

Creates a new RSS reader app.

**Inputs:**
- Environment (stage/production)
- App Name (instance title)
- App Description (manifest description)
- RSS Title (displayed in app UI)
- Icon URL
- RSS Feed URL

**Steps:**
1. Run workflow with inputs
2. Note the generated App ID from logs
3. Add app to `deployed-apps.yml`

### Update RSS Reader Apps

Updates one or all RSS reader apps.

**Inputs:**
- Environment (required)
- App key (empty = all apps, specific key = one app)
- Override fields (optional)

**Behavior:**
- Reads settings from `deployed-apps.yml`
- Applies overrides if provided
- Updates specified app(s)

## Configuration

**File:** `edge-apps/rss-reader/deployed-apps.yml`

```yaml
apps:
  app-key:
    id: "APP_ID"
    app_name: "Instance Title"
    description: "Manifest Description"
    rss_title: "UI Title"
    icon_url: "https://..."
    rss_url: "https://..."
```

## Examples

**Create new app:**
1. Run "Initialize" workflow
2. Copy App ID from logs
3. Add to `deployed-apps.yml`

**Update one app:**
```
App key: bbc-news
(overrides: optional)
```

**Update all apps:**
```
App key: (empty)
(overrides: optional)
```

**Change RSS URL:**
```
App key: bbc-news
Override RSS URL: https://new-url.com
```
