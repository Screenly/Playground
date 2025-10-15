# Custom RSS Reader Deployment Guide

This guide explains how to deploy and manage custom RSS reader Edge Apps using GitHub Actions.

## Overview

You can create multiple custom RSS reader apps (e.g., TechCrunch News, ESPN Sports, Bloomberg Finance) from a single base template without creating separate directories for each variant.

## Workflows

### 1. Initialize Custom RSS Reader App

**Use**: Create a **new** custom RSS reader app

**Location**: Actions → "Initialize Custom RSS Reader App"

**Inputs**:
- Environment (stage/production)
- **App Name** - Used for both instance title and RSS title (e.g., "BBC News")
- **App Description** - Manifest description (e.g., "Latest news from BBC World Service")
- Icon URL
- RSS Feed URL

**Process**:
1. Runs the workflow
2. Auto-generates an App ID
3. Deploys to Edge App store
4. Creates an instance with the app name
5. **Important**: Note the generated App ID from the logs!

**After initialization**:
- Add the app details to `edge-apps/rss-reader/deployed-apps.yml`

### 2. Update RSS Reader Apps 🔄

**Use**: Update **ONE specific app** OR **ALL apps** at once

**Location**: Actions → "Update RSS Reader Apps"

**Inputs**:
- Environment (stage/production) - **Required**
- App key - **Optional** (leave empty = update ALL apps, enter key = update one app)
- Override app name - **Optional** (updates RSS title)
- Override app description - **Optional**
- Override icon URL - **Optional**
- Override RSS URL - **Optional**

**Process**:
1. **Always reads** settings from `deployed-apps.yml` for each app
2. Creates a matrix (single app or all apps based on app key input)
3. Applies any overrides you provided
4. Updates manifest(s)
5. Deploys in parallel

**How it works**:
- **Leave app key empty** → Updates ALL apps
- **Enter an app key** → Updates only that specific app
- **All settings come from `deployed-apps.yml`** (unless you override)
- **Overrides are optional** → Change only what you need
- **Note**: Override app name changes both the instance title and RSS title

**When to use**:
- ✅ Updated base template code (leave app key empty = all apps)
- ✅ Fixed a bug (leave app key empty = all apps)
- ✅ Need to redeploy one app (enter app key)
- ✅ Need to change RSS URL for one app (enter app key + override RSS URL)
- ✅ Update all apps + change settings (enter overrides)

**Benefits**:
- 🎯 **Unified**: One workflow for all update scenarios
- 📖 **Config-driven**: Always reads from `deployed-apps.yml`
- ⚡ **Parallel**: Multiple apps update simultaneously
- 🛡️ **Safe**: Continues even if one app fails
- 🔧 **Flexible overrides**: Change only what you need


## Configuration File

**File**: `edge-apps/rss-reader/deployed-apps.yml`

Tracks all deployed RSS reader apps. Format:

```yaml
apps:
  app-key-name:
    id: "SCREENLY_APP_ID"
    app_name: "App Name"           # Used for instance title and RSS title
    description: "App Description" # Manifest description
    icon_url: "https://example.com/icon.svg"
    rss_url: "https://example.com/feed.xml"
```

## Workflow Example

### Creating a new TechCrunch RSS reader:

1. **Initialize**:
   - Go to Actions → "Initialize Custom RSS Reader App"
   - Enter:
     - Environment: `stage`
     - App Name: `TechCrunch`
     - App Description: `Latest tech news from TechCrunch`
     - Icon URL: `https://example.com/techcrunch.svg`
     - RSS URL: `https://techcrunch.com/feed/`
   - Run workflow
   - **Copy the generated App ID** from logs (e.g., `01HXX...`)

2. **Add to config**:
   - Edit `edge-apps/rss-reader/deployed-apps.yml`
   - Add:
     ```yaml
     techcrunch-tech:
       id: "01HXX..."  # Use the ID from step 1
       app_name: "TechCrunch"
       description: "Latest tech news from TechCrunch"
       icon_url: "https://example.com/techcrunch.svg"
       rss_url: "https://techcrunch.com/feed/"
     ```
   - Commit and push

3. **Future updates**:
   - Go to Actions → "Update RSS Reader Apps"
   - Enter:
     - Environment: `stage`
     - App Key: `techcrunch-tech`
   - Leave other fields empty (uses config values)
   - Run workflow

### Updating just the RSS URL:

- Go to Actions → "Update RSS Reader Apps"
- Enter:
  - Environment: `stage`
  - App Key: `techcrunch-tech`
  - Override RSS URL: `https://new-feed-url.com/rss`
- Leave other fields empty
- The workflow will use config values for everything except the RSS URL