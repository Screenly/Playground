# Custom RSS Reader Deployment Guide

This guide explains how to deploy and manage custom RSS reader Edge Apps using GitHub Actions.

## Overview

You can create multiple custom RSS reader apps (e.g., TechCrunch News, ESPN Sports, Bloomberg Finance) from a single base template without creating separate directories for each variant.

## Workflows

### 1. Initialize Custom RSS Reader

**Use**: Create a **new** custom RSS reader app

**Location**: Actions → "Initialize Custom RSS Reader"

**Inputs**:
- Environment (stage/production)
- App Description
- Icon URL
- RSS Feed URL  
- RSS Title
- Instance Title

**Process**:
1. Runs the workflow
2. Auto-generates an App ID
3. Deploys to Edge App store
4. **Important**: Note the generated App ID from the logs!

**After initialization**:
- Add the app details to `edge-apps/rss-reader/deployed-apps.yml`

### 2. Update RSS Reader Apps 🔄

**Use**: Update **ONE specific app** OR **ALL apps** at once

**Location**: Actions → "Update RSS Reader Apps"

**Inputs**:
- Environment (stage/production) - **Required**
- App key - **Optional** (leave empty = update ALL apps, enter key = update one app)
- Override description - **Optional**
- Override icon URL - **Optional**
- Override RSS URL - **Optional**
- Override RSS title - **Optional**

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

**When to use**:
- ✅ Updated base template code (leave app key empty = all apps)
- ✅ Fixed a bug (leave app key empty = all apps)
- ✅ Need to redeploy one app (enter app key)
- ✅ Need to change RSS URL for one app (enter app key + override RSS URL)
- ✅ Update all apps + change settings for one (enter overrides)

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
    description: "App Display Name"
    icon_url: "https://example.com/icon.svg"
    rss_url: "https://example.com/feed.xml"
    rss_title: "Feed Title"
```

## Workflow Example

### Creating a new TechCrunch RSS reader:

1. **Initialize**:
   - Go to Actions → "Initialize Custom RSS Reader"
   - Enter:
     - Environment: `stage`
     - Description: `TechCrunch Tech News`
     - Icon URL: `https://example.com/techcrunch.svg`
     - RSS URL: `https://techcrunch.com/feed/`
     - RSS Title: `TechCrunch`
     - Instance Title: `TechCrunch News`
   - Run workflow
   - **Copy the generated App ID** from logs (e.g., `01HXX...`)

2. **Add to config**:
   - Edit `edge-apps/rss-reader/deployed-apps.yml`
   - Add:
     ```yaml
     techcrunch-tech:
       id: "01HXX..."  # Use the ID from step 1
       description: "TechCrunch Tech News"
       icon_url: "https://example.com/techcrunch.svg"
       rss_url: "https://techcrunch.com/feed/"
       rss_title: "TechCrunch"
     ```
   - Commit and push

3. **Future updates**:
   - Go to Actions → "Update Custom RSS Reader"
   - Enter:
     - Environment: `stage`
     - App Key: `techcrunch-tech`
   - Leave other fields empty (uses config values)
   - Run workflow

### Updating just the RSS URL:

- Go to Actions → "Update Custom RSS Reader"
- Enter:
  - App Key: `techcrunch-tech`
  - RSS URL: `https://new-feed-url.com/rss`
- Leave other fields empty
- The workflow will use config values for everything except the RSS URL

## Common Scenarios

### Scenario 1: Fixed a bug in the base RSS reader template
**Solution**: Use "Update RSS Reader Apps"
- Select environment
- **Leave app key empty**
- Leave overrides empty
- Click run
- Result: All apps get the fix! ✅

### Scenario 2: Need to change RSS URL for one app only
**Solution**: Use "Update RSS Reader Apps"
- Select environment
- Enter app key (e.g., `bbc-news`)
- Enter "Override RSS URL" with new URL
- Leave other overrides empty
- Result: Only BBC News gets updated with new RSS URL! ✅

### Scenario 3: Redeploy one app (no changes)
**Solution**: Use "Update RSS Reader Apps"
- Select environment
- Enter app key
- Leave all overrides empty
- Result: App redeploys with config from `deployed-apps.yml`! ✅

### Scenario 4: Redeploy all apps (no changes)
**Solution**: Use "Update RSS Reader Apps"
- Select environment
- **Leave app key empty**
- Leave all overrides empty
- Result: All apps redeploy with their configs from `deployed-apps.yml`! ✅

### Scenario 5: Update all apps + change one app's RSS URL
**Solution**: Use "Update RSS Reader Apps"
- Select environment
- **Leave app key empty** (this updates all apps)
- Enter "Override RSS URL" with new URL
- Result: All apps get template update, all apps also get the new RSS URL! ✅
- **Note**: Overrides apply to ALL apps when app key is empty

### Scenario 6: Just want to update one specific app's settings
**Solution**: Edit `deployed-apps.yml`, then run "Update RSS Reader Apps"
- Update the app's config in `deployed-apps.yml`
- Commit and push changes
- Run workflow with that app's key
- Leave overrides empty
- Result: App updates with new config from file! ✅

## Benefits

✅ **Single template**: Maintain one codebase  
✅ **Multiple deployments**: Create unlimited custom RSS readers  
✅ **No clutter**: No separate directories needed  
✅ **Easy updates**: Just provide the app key  
✅ **Bulk updates**: One-click to update all apps  
✅ **Parallel deployment**: All apps update simultaneously  
✅ **Tracked configuration**: All apps documented in `deployed-apps.yml`  
✅ **Flexible overrides**: Can still customize on-the-fly  

## Tips

- Use kebab-case for app keys (e.g., `bbc-news`, `techcrunch-tech`)
- Always note the App ID after initialization
- Keep `deployed-apps.yml` updated after each initialization
- Use "Update All" workflow when you modify the base template code
- Use "Update Custom" workflow when you need to change settings for one app
- The matrix strategy in "Update All" runs apps in parallel for speed

