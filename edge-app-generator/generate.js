#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Generator is in Playground/edge-app-generator/
// Framework is included in generator/framework/
// Apps should be generated in ../edge-apps/
const generatorDir = __dirname;
const playgroundDir = path.resolve(generatorDir, '..');
const edgeAppsDir = path.join(playgroundDir, 'edge-apps');
const frameworkSource = path.join(generatorDir, 'framework');
const configSource = path.resolve(playgroundDir, '..', 'weather');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function generateApp() {
  console.log('\n🚀 Edge Apps Generator\n');
  console.log('This will create a new edge app in the edge-apps/ directory.\n');

  // Verify framework exists
  if (!fs.existsSync(frameworkSource)) {
    console.log(`❌ Framework not found at: ${frameworkSource}`);
    console.log('   The framework should be included in the generator.');
    process.exit(1);
  }

  // Get app name
  const appName = await question('App name (e.g., clock, dashboard): ');
  if (!appName || appName.trim() === '') {
    console.log('❌ App name is required');
    process.exit(1);
  }

  const sanitizedName = appName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const appDir = path.join(edgeAppsDir, sanitizedName);

  // Check if directory exists
  if (fs.existsSync(appDir)) {
    const overwrite = await question(`Directory "${sanitizedName}" already exists. Overwrite? (y/N): `);
    if (overwrite.toLowerCase() !== 'y') {
      console.log('❌ Cancelled');
      process.exit(0);
    }
    fs.rmSync(appDir, { recursive: true, force: true });
  }

  // Get reference resolution (all optional with defaults)
  console.log('\nReference Resolution (press Enter to use defaults):');
  const orientationInput = await question('Orientation (landscape/portrait) [landscape]: ');
  const orientation = orientationInput.trim() || 'landscape';
  
  let refWidth, refHeight;
  if (orientation === 'portrait') {
    refWidth = 1080;
    refHeight = 1920;
  } else {
    refWidth = 1920;
    refHeight = 1080;
  }

  const customRes = await question(`Use custom resolution? (y/N) [N]: `);
  if (customRes.toLowerCase() === 'y') {
    const widthInput = await question(`Width [${refWidth}]: `);
    const heightInput = await question(`Height [${refHeight}]: `);
    if (widthInput.trim()) refWidth = parseInt(widthInput.trim(), 10) || refWidth;
    if (heightInput.trim()) refHeight = parseInt(heightInput.trim(), 10) || refHeight;
  }

  // Get dev tools preference (default: yes)
  const enableDevToolsInput = await question('Enable dev tools? (Y/n) [Y]: ');
  const devToolsEnabled = enableDevToolsInput.trim().toLowerCase() !== 'n';

  // Ask about Screenly integration
  console.log('\nScreenly Integration:');
  const screenlyIntegration = await question('Include Screenly metadata files? (Y/n) [Y]: ');
  const includeScreenly = screenlyIntegration.trim().toLowerCase() !== 'n';

  let appDescription = '';
  let appAuthor = '';
  if (includeScreenly) {
    appDescription = await question(`App description [${appName} edge app]: `) || `${appName} edge app`;
    appAuthor = await question('Author [Screenly, Inc.]: ') || 'Screenly, Inc.';
  }

  console.log('\n📦 Generating app structure...\n');

  // Create directory structure
  createDirectory(appDir);
  createDirectory(path.join(appDir, 'src'));
  
  // Create static directory structure if Screenly integration is enabled
  if (includeScreenly) {
    createDirectory(path.join(appDir, 'static'));
    createDirectory(path.join(appDir, 'static', 'images'));
    createDirectory(path.join(appDir, 'static', 'fonts'));
    createDirectory(path.join(appDir, 'static', 'js'));
    createDirectory(path.join(appDir, 'static', 'styles'));
  }

  // Copy package.json
  const packageJson = {
    name: `edge-app-${sanitizedName}`,
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview --outDir build'
    },
    devDependencies: {
      '@types/node': '^20.10.0',
      'autoprefixer': '^10.4.16',
      'postcss': '^8.4.32',
      'tailwindcss': '^3.4.0',
      'typescript': '^5.3.3',
      'vite': '^5.0.8'
    }
  };
  fs.writeFileSync(
    path.join(appDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Copy config files from weather app
  const configFiles = [
    'tsconfig.json',
    'tailwind.config.js',
    'postcss.config.js',
    'vite.config.ts',
    '.gitignore'
  ];

  configFiles.forEach(file => {
    const srcPath = path.join(configSource, file);
    const destPath = path.join(appDir, file);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ Copied ${file}`);
    }
  });

  // Create HTML template
  let htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{appName}} - Edge App</title>
  <link rel="stylesheet" href="/src/core/css/edge-app.css">
  <link rel="stylesheet" href="/src/app.css">
</head>
<body>
  <!-- Animated background gradient - full viewport (outside scaled container) -->
  <div class="background-gradient"></div>
  
  <div id="app" class="edge-app-container">
    <div class="safe-zone app-content">
      <!-- Main content -->
      <div class="main-content edge-app-flex edge-app-flex-center edge-app-fullscreen">
        <div class="content-card">
          <div class="greeting">Hello, World!</div>
          <div class="app-title">{{appName}}</div>
          <div class="subtitle">Your edge app is ready</div>
          <div class="status-indicator">
            <span class="status-dot"></span>
            <span class="status-text">Running</span>
          </div>
        </div>
      </div>
      
      <!-- Footer info -->
      <div class="footer-info">
        <div class="info-item">
          <span class="info-label">Scale:</span>
          <span class="info-value" id="scale-value">1.000</span>
        </div>
        <div class="info-item">
          <span class="info-label">Resolution:</span>
          <span class="info-value" id="resolution-value">{{refWidth}}×{{refHeight}}</span>
        </div>
      </div>
    </div>
  </div>

  {{screenlyScript}}
  <script type="module" src="/src/app.js"></script>
</body>
</html>`;

  const screenlyScript = includeScreenly 
    ? '<script src="screenly.js?version=1"></script>\n  ' 
    : '';

  fs.writeFileSync(
    path.join(appDir, 'index.html'),
    htmlTemplate
      .replace(/{{appName}}/g, appName)
      .replace(/{{refWidth}}/g, refWidth)
      .replace(/{{refHeight}}/g, refHeight)
      .replace(/{{screenlyScript}}/g, screenlyScript)
  );

  // Create app.js
  let appJsTemplate = `import { initEdgeApp } from './core/index';

// Initialize the edge app framework
const { scaler } = initEdgeApp('app', {
  referenceWidth: {{refWidth}},
  referenceHeight: {{refHeight}},
  orientation: '{{orientation}}',
  enableDevTools: {{devToolsEnabled}},
});

// Update scale display
function updateScaleDisplay() {
  const scaleValue = document.getElementById('scale-value');
  if (scaleValue) {
    scaleValue.textContent = scaler.getScale().toFixed(3);
  }
}

// Initial update
updateScaleDisplay();

// Update on scale change
if (scaler) {
  // Listen for scale changes (you can extend AutoScaler to emit events)
  setInterval(() => {
    updateScaleDisplay();
  }, 100);
}

// Update resolution display
const resolutionValue = document.getElementById('resolution-value');
if (resolutionValue) {
  resolutionValue.textContent = '{{refWidth}}×{{refHeight}}';
}

console.log('Edge app initialized with scale:', scaler.getScale());

{{readySignal}}`;

  const readySignal = includeScreenly 
    ? `// Signal ready for Screenly rendering
if (typeof screenly !== 'undefined' && screenly.signalReadyForRendering) {
  screenly.signalReadyForRendering();
}`
    : '';

  appJsTemplate = appJsTemplate.replace(/{{readySignal}}/g, readySignal);

  fs.writeFileSync(
    path.join(appDir, 'src', 'app.js'),
    appJsTemplate
      .replace(/{{refWidth}}/g, refWidth)
      .replace(/{{refHeight}}/g, refHeight)
      .replace(/{{orientation}}/g, orientation)
      .replace(/{{devToolsEnabled}}/g, devToolsEnabled)
  );

  // Create app.css
  const appCssTemplate = `/* {{appName}} App Styles */

/* Animated background gradient - full viewport */
.background-gradient {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 200% 200%;
  animation: gradientShift 15s ease infinite;
  opacity: 0.9;
  z-index: 0;
  pointer-events: none;
}

#app {
  position: relative;
  z-index: 1;
}

.app-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  color: white;
  position: relative;
  z-index: 1;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Main content */
.main-content {
  position: relative;
  z-index: 1;
  flex-direction: column;
  gap: 40px;
}

.content-card {
  text-align: center;
  padding: 60px 80px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.greeting {
  font-size: 72px;
  font-weight: 700;
  color: white;
  margin-bottom: 20px;
  text-shadow: 2px 2px 20px rgba(0, 0, 0, 0.3);
  letter-spacing: -2px;
}

.app-title {
  font-size: 48px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 16px;
  text-transform: capitalize;
  letter-spacing: -1px;
}

.subtitle {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 32px;
  font-weight: 400;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.status-dot {
  width: 12px;
  height: 12px;
  background: #4ade80;
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(74, 222, 128, 0.6);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.status-text {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* Footer info */
.footer-info {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 40px;
  z-index: 1;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 16px 32px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.info-value {
  font-size: 18px;
  color: white;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

/* Responsive adjustments for different screen sizes */
@media (max-width: 1200px) {
  .greeting {
    font-size: 56px;
  }
  
  .app-title {
    font-size: 36px;
  }
  
  .subtitle {
    font-size: 20px;
  }
  
  .content-card {
    padding: 40px 60px;
  }
}

/* Add your custom styles here */
`;

  fs.writeFileSync(
    path.join(appDir, 'src', 'app.css'),
    appCssTemplate.replace(/{{appName}}/g, appName)
  );

  // Copy framework core
  const coreDest = path.join(appDir, 'src', 'core');
  
  console.log('📦 Copying framework core...');
  copyDirectory(frameworkSource, coreDest);

  // Generate Screenly metadata files if enabled
  if (includeScreenly) {
    console.log('📦 Creating Screenly metadata files...');
    generateScreenlyFiles(appDir, appName, appDescription, appAuthor);
  }

  // Generate README
  generateREADME(appDir, appName, includeScreenly);

  console.log('✅ App generated successfully!\n');
  console.log(`📁 Location: ${appDir}\n`);
  console.log('Next steps:');
  console.log(`  cd edge-apps/${sanitizedName}`);
  console.log('  bun install');
  console.log('  bun run dev\n');

  rl.close();
}

function generateScreenlyFiles(appDir, appName, description, author) {
  // Generate screenly.yml
  const screenlyYml = `---
syntax: manifest_v1
id: # Generated when you run: screenly edge-app create
ready_signal: true
description: ${description}
icon: 'static/images/icon.svg'
author: ${author}
settings:
  # Add your app settings here
  # Example:
  # api_key:
  #   type: secret
  #   title: API Key
  #   optional: false
  #   is_global: true
  #   help_text: Enter your API key
`;

  fs.writeFileSync(path.join(appDir, 'screenly.yml'), screenlyYml);

  // Generate screenly_qc.yml (same structure, for QC environment)
  fs.writeFileSync(path.join(appDir, 'screenly_qc.yml'), screenlyYml);

  // Create a placeholder icon SVG
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#0066FF" rx="8"/>
  <text x="32" y="42" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">${appName.charAt(0).toUpperCase()}</text>
</svg>`;

  fs.writeFileSync(path.join(appDir, 'static', 'images', 'icon.svg'), iconSvg);
}

function generateREADME(appDir, appName, includeScreenly) {
  let readme = `# ${appName.charAt(0).toUpperCase() + appName.slice(1)} Edge App

${includeScreenly ? `![${appName} App Preview](static/images/${appName}-preview.png)` : ''}

${includeScreenly ? `## Prerequisites

- Install Screenly CLI - Please follow the guide [here](https://github.com/Screenly/cli)

## Deployment to Screenly

### Step 1: Log in to Screenly

\`\`\`bash
screenly login
\`\`\`

### Step 2: Create Edge App

\`\`\`bash
screenly edge-app create --name "${appName.charAt(0).toUpperCase() + appName.slice(1)} Edge App" --in-place
\`\`\`

### Step 3: Build for Production

\`\`\`bash
bun run build
\`\`\`

This creates a \`build/\` directory with optimized files.

### Step 4: Deploy

\`\`\`bash
# Deploy from the build directory
cd build
screenly edge-app deploy
\`\`\`

Or deploy from root (Screenly will use build/ if it exists):

\`\`\`bash
screenly edge-app deploy
\`\`\`

### Step 5: Create Instance

\`\`\`bash
screenly edge-app instance create
\`\`\`

### Step 6: Configure Settings

Configure any required settings via CLI or the Screenly dashboard.

\`\`\`bash
# Example: Set a setting
screenly edge-app setting set setting_name=value

# Example: Set a secret
screenly edge-app secret set secret_name=value
\`\`\`

### Step 7: Assign to Playlist

- Open the Screenly dashboard
- Assign the edge app to a playlist
- Assign the playlist to a device

` : ''}## Development

### Installation

\`\`\`bash
bun install
\`\`\`

### Run Development Server

\`\`\`bash
bun run dev
\`\`\`

### Build for Production

\`\`\`bash
bun run build
\`\`\`

This creates a \`build/\` directory with optimized files ready for deployment.

**Build output includes:**
- Compiled and minified JavaScript
- Processed CSS
- Static assets (from \`static/\` directory)
- Screenly metadata files (if present)

**Preview the build:**
\`\`\`bash
bun run preview
\`\`\`

## Framework

This app uses the Edge Apps Framework for automatic scaling and safe zones.

- **Reference Resolution**: Configured in \`src/app.js\`
- **Auto-Scaling**: Automatically scales from reference resolution to any screen size
- **Safe Zones**: Built-in safe zones prevent overscan cropping

## Customization

- Edit \`index.html\` for structure
- Edit \`src/app.js\` for logic
- Edit \`src/app.css\` for styles
${includeScreenly ? `- Edit \`screenly.yml\` for Screenly metadata and settings` : ''}
`;

  fs.writeFileSync(path.join(appDir, 'README.md'), readme);
}

// Run generator
generateApp().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

