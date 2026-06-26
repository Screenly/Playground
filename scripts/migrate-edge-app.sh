#!/usr/bin/env bash
# Migrates an Edge App from the Playground monorepo to a new standalone repo.
#
# Usage:
#   ./scripts/migrate-edge-app.sh <app-dir> <repo-name> <description> <issue-number> <app-description>
#
# Arguments:
#   app-dir          Directory name under edge-apps/ (e.g. welcome-app)
#   repo-name        Target GitHub repo name (e.g. welcome-app)
#   description      GitHub repo description (e.g. "A customizable welcome screen Edge App")
#   issue-number     Playground issue number to close (e.g. 844)
#   app-description  Short description for the root README entry (e.g. "A customizable welcome screen app.")
#
# Example:
#   ./scripts/migrate-edge-app.sh welcome-app welcome-app "A customizable welcome screen Edge App for Screenly" 844 "A customizable welcome screen app."
#
# What it does:
#   1.  Creates a public repo under Screenly/<repo-name>
#   2.  Clones it into /Users/nicomiguelino/Code/GitHub/Screenly/<repo-name>
#       (or inits + adds remote if the local dir already exists)
#   3.  Copies source files from edge-apps/<app-dir> (excluding node_modules, .DS_Store)
#   4.  Fixes package.json prettier path from ../.prettierrc.json to ./.prettierrc.json
#   5.  Adds .prettierrc.json
#   6.  Runs git submodule add for .claude
#   7.  Commits source files and pushes to main
#   8.  Sets main as default branch
#   9.  Creates development branch
#  10.  Opens a draft PR on chore/add-workflows that adds:
#       - .github/workflows/checks.yml
#       - .github/workflows/initialize-edge-app.yml
#       - .github/workflows/update-edge-app.yml
#       - .github/dependabot.yml
#       (Introducing workflows via PR ensures GitHub indexes workflow_dispatch correctly.)
#  11. Adds admin collaborators
#  12. Creates stage and production environments with required reviewers
#  13. Opens a draft Playground PR on chore/remove-<app-dir> that:
#      - Removes source files, keeping only README.md and static/
#      - Replaces README.md with a redirect to the standalone repo
#      - Updates the root README.md entry to point to the standalone repo
#      - References the closing issue

set -euo pipefail

APP_DIR="${1:?Usage: $0 <app-dir> <repo-name> <description> <issue-number> <app-description>}"
REPO_NAME="${2:?Usage: $0 <app-dir> <repo-name> <description> <issue-number> <app-description>}"
DESCRIPTION="${3:-Edge App for Screenly digital signage screens}"
ISSUE_NUMBER="${4:-}"
APP_DESCRIPTION="${5:-}"

PLAYGROUND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SCREENLY_DIR="/Users/nicomiguelino/Code/GitHub/Screenly"
SOURCE_DIR="${PLAYGROUND_DIR}/edge-apps/${APP_DIR}"
DEST_DIR="${SCREENLY_DIR}/${REPO_NAME}"
REMOTE_URL="git@github.com:Screenly/${REPO_NAME}.git"

ADMIN_COLLABORATORS=(
  salmanfarisvp
)

ENVIRONMENT_REVIEWERS=(
  salmanfarisvp
)

# Derive a human-readable app title from repo name (e.g. welcome-app -> Welcome App)
APP_TITLE=$(echo "$REPO_NAME" | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)}1')

echo "==> Migrating '${APP_DIR}' to 'Screenly/${REPO_NAME}'"

# 1. Create repo on GitHub (internal visibility)
if gh api "repos/Screenly/${REPO_NAME}" &>/dev/null; then
  echo "    Repo already exists on GitHub, skipping creation."
else
  echo "==> Creating GitHub repo Screenly/${REPO_NAME}..."
  gh repo create "Screenly/${REPO_NAME}" \
    --public \
    --description "${DESCRIPTION}"
fi

# 2. Clone or init local repo and ensure remote is set
if [ -d "${DEST_DIR}/.git" ]; then
  echo "    Local repo already exists at ${DEST_DIR}, skipping clone."
  cd "${DEST_DIR}"
  if ! git remote get-url origin &>/dev/null; then
    echo "==> Adding remote origin..."
    git remote add origin "${REMOTE_URL}"
  fi
elif [ -d "${DEST_DIR}" ]; then
  echo "==> Initializing git repo in existing directory ${DEST_DIR}..."
  cd "${DEST_DIR}"
  git init
  git remote add origin "${REMOTE_URL}"
else
  echo "==> Cloning into ${DEST_DIR}..."
  gh repo clone "Screenly/${REPO_NAME}" "${DEST_DIR}"
  cd "${DEST_DIR}"
fi

# 3. Create main branch locally
git checkout -b main 2>/dev/null || git checkout main

# 4. Copy source files
echo "==> Copying source files..."
rsync -a \
  --exclude='node_modules' \
  --exclude='.DS_Store' \
  --exclude='static/.DS_Store' \
  "${SOURCE_DIR}/" "${DEST_DIR}/"

# 5. Fix prettier path in package.json if it references ../
if [ -f "${DEST_DIR}/package.json" ]; then
  sed -i '' 's|"prettier": "\.\./\.prettierrc\.json"|"prettier": "./.prettierrc.json"|g' "${DEST_DIR}/package.json"
fi

# 6. Add .prettierrc.json
cat > "${DEST_DIR}/.prettierrc.json" << 'EOF'
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "semi": false,
  "singleQuote": true,
  "printWidth": 80
}
EOF

# 7. Add .claude submodule
if [ ! -f "${DEST_DIR}/.gitmodules" ]; then
  echo "==> Adding .claude submodule..."
  git submodule add https://github.com/Screenly/edge-apps-claude-config .claude
  git config -f .gitmodules submodule..claude.ignore untracked
fi

# 8. Initial commit on main (source files only, no workflows yet)
echo "==> Creating initial commit on main..."
git add -A
if git diff --cached --quiet; then
  echo "    Nothing to commit, source files already in place."
else
  git commit -m "chore: initial commit

- add ${APP_DIR} Edge App source files
- add .prettierrc.json
- add .claude submodule"
  git push -u origin main
fi

# 9. Set main as default branch (may require org admin permissions)
echo "==> Setting main as default branch..."
if gh api --method PATCH "repos/Screenly/${REPO_NAME}" -f default_branch=main &>/dev/null; then
  echo "    Default branch set to main."
else
  echo "    WARNING: Could not set default branch to main (insufficient permissions)."
  echo "    An org admin can change it in: https://github.com/Screenly/${REPO_NAME}/settings"
fi

# 10. Create development branch
if git ls-remote --exit-code origin development &>/dev/null; then
  echo "    development branch already exists on remote, skipping."
else
  echo "==> Creating development branch..."
  git checkout -b development
  git push -u origin development
  git checkout main
fi

# 11. Add workflows on a separate branch and open a draft PR
echo "==> Creating chore/add-workflows branch..."
git checkout -b chore/add-workflows 2>/dev/null || git checkout chore/add-workflows

mkdir -p "${DEST_DIR}/.github/workflows"

cat > "${DEST_DIR}/.github/workflows/checks.yml" << EOF
name: Checks

on:
  push:
    branches:
      - development
      - main
  pull_request:
    branches:
      - development
      - main

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: Screenly/edge-apps-actions/checks@v1
EOF

cat > "${DEST_DIR}/.github/workflows/initialize-edge-app.yml" << 'WORKFLOW'
---
name: Initialize Edge App

on:
  workflow_dispatch:
    inputs:
      environment:
        description: Target environment for initialization
        required: true
        default: stage
        type: choice
        options:
          - stage
          - production
      edge_app_name:
        description: Edge App name (used for the CLI --name flag)
        required: true
        type: string
      edge_app_title:
        description: Display title for the Edge App instance
        required: true
        type: string

run-name: Initializing ${{ inputs.edge_app_name }} in ${{ inputs.environment }}

jobs:
  initialize:
    name: Initializing ${{ inputs.edge_app_name }} in ${{ inputs.environment }}
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v7
        with:
          ref: ${{ inputs.environment == 'production' && 'main' || github.ref }}
      - uses: Screenly/edge-apps-actions/initialize@v1
        with:
          screenly_api_token: ${{ secrets.SCREENLY_API_TOKEN }}
          edge_app_name: ${{ inputs.edge_app_name }}
          edge_app_title: ${{ inputs.edge_app_title }}
          environment: ${{ inputs.environment }}
WORKFLOW

cat > "${DEST_DIR}/.github/workflows/update-edge-app.yml" << EOF
---
name: Update Edge App

on:
  workflow_dispatch:
  push:
    branches:
      - development
      - main

run-name: Updating ${APP_TITLE} in \${{ github.event_name == 'workflow_dispatch' && 'stage' || (github.ref == 'refs/heads/main' && 'production' || 'stage') }}

jobs:
  deploy-stage:
    name: Updating ${APP_TITLE} in stage
    runs-on: ubuntu-latest
    if: (github.event_name == 'push' && github.ref == 'refs/heads/development') || github.event_name == 'workflow_dispatch'
    environment: stage
    steps:
      - uses: actions/checkout@v7
      - uses: Screenly/edge-apps-actions/update@v1
        with:
          screenly_api_token: \${{ secrets.SCREENLY_API_TOKEN }}
          environment: stage
          delete_missing_settings: 'true'

  deploy-production:
    name: Updating ${APP_TITLE} in production
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v7
      - uses: Screenly/edge-apps-actions/update@v1
        with:
          screenly_api_token: \${{ secrets.SCREENLY_API_TOKEN }}
          environment: production
          delete_missing_settings: 'true'
EOF

cat > "${DEST_DIR}/.github/dependabot.yml" << 'EOF'
version: 2

updates:
  - package-ecosystem: 'bun'
    directory: '/'
    schedule:
      interval: 'monthly'
    groups:
      bun:
        patterns:
          - '*'

  - package-ecosystem: 'github-actions'
    directory: '/'
    schedule:
      interval: 'monthly'
    groups:
      github-actions:
        patterns:
          - '*'
EOF

git add .github/
if git diff --cached --quiet; then
  echo "    Workflows already committed, skipping."
else
  git commit -m "chore: add GitHub Actions workflows and Dependabot config

- add checks workflow
- add initialize-edge-app workflow
- add update-edge-app workflow
- add dependabot config for bun and github-actions"
  git push -u origin chore/add-workflows
fi

echo "==> Opening draft PR for workflows..."
if gh pr view chore/add-workflows --repo "Screenly/${REPO_NAME}" &>/dev/null; then
  echo "    PR already exists, skipping."
else
  gh pr create \
    --repo "Screenly/${REPO_NAME}" \
    --base main \
    --head chore/add-workflows \
    --draft \
    --title "chore: add GitHub Actions workflows and Dependabot config" \
    --body "$(cat <<'BODY'
## Summary

- Add CI checks workflow
- Add initialize and update Edge App workflows
- Add Dependabot config for bun and github-actions dependencies
BODY
)"
fi

git checkout main

# 12. Add admin collaborators
echo "==> Adding admin collaborators..."
for collaborator in "${ADMIN_COLLABORATORS[@]}"; do
  gh api --method PUT "repos/Screenly/${REPO_NAME}/collaborators/${collaborator}" -f permission=admin
  echo "    Added ${collaborator} as admin."
done

# 13. Create stage and production environments with required reviewers
echo "==> Setting up environments with required reviewers..."
reviewer_args=()
for reviewer in "${ENVIRONMENT_REVIEWERS[@]}"; do
  reviewer_id=$(gh api "users/${reviewer}" --jq '.id')
  reviewer_args+=(--field "reviewers[][type]=User" --field "reviewers[][id]=${reviewer_id}")
done
for environment in stage production; do
  gh api --method PUT "repos/Screenly/${REPO_NAME}/environments/${environment}" "${reviewer_args[@]}" &>/dev/null
  echo "    Created '${environment}' with required reviewers."
done

# 14. Open Playground cleanup PR (only if issue number and app description are provided)
if [ -n "${ISSUE_NUMBER}" ] && [ -n "${APP_DESCRIPTION}" ]; then
  echo "==> Creating Playground cleanup PR..."
  cd "${PLAYGROUND_DIR}"

  PLAYGROUND_BRANCH="chore/remove-${APP_DIR}"
  git checkout master
  git checkout -b "${PLAYGROUND_BRANCH}" 2>/dev/null || git checkout "${PLAYGROUND_BRANCH}"

  # Remove everything in the app dir except README.md and static/
  find "${SOURCE_DIR}" -mindepth 1 -maxdepth 1 \
    ! -name 'README.md' \
    ! -name 'static' \
    -exec rm -rf {} +

  # Write redirect README
  cat > "${SOURCE_DIR}/README.md" << EOF
# ${APP_TITLE}

This app has been moved to its own repository: [Screenly/${REPO_NAME}](https://github.com/Screenly/${REPO_NAME}/)
EOF

  # Update root README: replace the existing entry with a standalone repo link
  OLD_ENTRY="https://github.com/Screenly/Playground/tree/master/edge-apps/${APP_DIR}"
  NEW_ENTRY="https://github.com/Screenly/${REPO_NAME}/"
  sed -i '' \
    "s|(\(${OLD_ENTRY}\)) - \(.*\)|(${NEW_ENTRY}) - ${APP_DESCRIPTION} _(Moved to a separate repository)_|" \
    "${PLAYGROUND_DIR}/README.md"

  git add -A
  git commit -m "chore: migrate ${APP_DIR} to standalone repo

- remove source files from edge-apps/${APP_DIR}
- redirect README to Screenly/${REPO_NAME}
- update root README entry"

  git push -u origin "${PLAYGROUND_BRANCH}"

  gh pr create \
    --repo "Screenly/Playground" \
    --base master \
    --head "${PLAYGROUND_BRANCH}" \
    --draft \
    --assignee "@me" \
    --title "chore: migrate ${APP_DIR} to standalone repo" \
    --body "Removes source files from \`edge-apps/${APP_DIR}\` and redirects to [Screenly/${REPO_NAME}](https://github.com/Screenly/${REPO_NAME}/). Closes #${ISSUE_NUMBER}."

  git checkout master
else
  echo "    Skipping Playground PR (no issue number or app description provided)."
fi

echo ""
echo "Done! Repo available at: https://github.com/Screenly/${REPO_NAME}"
echo "Remember to:"
echo "  - Set up 'stage' and 'production' environments with SCREENLY_API_TOKEN"
echo "  - Merge the workflows PR, then run 'Initialize Edge App' for each environment"
