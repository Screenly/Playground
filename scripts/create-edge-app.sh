#!/bin/bash

# Check if app name is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <app-name>"
    echo "Example: $0 my-awesome-app"
    exit 1
fi

APP_NAME="$1"
TEMPLATE_DIR="edge-apps/edge-app-template"
TARGET_DIR="edge-apps/$APP_NAME"

# Check if template exists
if [ ! -d "$TEMPLATE_DIR" ]; then
    echo "Error: Template directory '$TEMPLATE_DIR' not found"
    exit 1
fi

# Check if target directory already exists
if [ -d "$TARGET_DIR" ]; then
    echo "Error: Directory '$TARGET_DIR' already exists"
    exit 1
fi

echo "Creating new Edge App: $APP_NAME"

# Copy template directory
cp -r "$TEMPLATE_DIR" "$TARGET_DIR"

rm -rf "$TARGET_DIR/node_modules" 2>/dev/null || true

# Update package.json and bun.lock
sed -i "s/\"name\": \"edge-app-template\"/\"name\": \"$APP_NAME\"/" "$TARGET_DIR/package.json"
sed -i "s/\"name\": \"edge-app-template\"/\"name\": \"$APP_NAME\"/" "$TARGET_DIR/bun.lock"

# Update screenly.yml
sed -i "s/name: edge-app-template/name: $APP_NAME/" "$TARGET_DIR/screenly.yml"
sed -i "s/title: Edge App Template/title: $APP_NAME/" "$TARGET_DIR/screenly.yml"

# Update README.md
sed -i "s/# Edge App Template/# $APP_NAME/" "$TARGET_DIR/README.md"

echo "✅ Edge App '$APP_NAME' created successfully!"
echo ""
echo "Next steps:"
echo "1. cd $TARGET_DIR"
echo "2. npm install (or bun install)"
echo "3. npm run dev (or bun run dev)"
echo ""
echo "Happy coding! 🚀"
