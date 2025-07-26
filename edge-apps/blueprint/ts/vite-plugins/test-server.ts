import type { ViteDevServer, Plugin } from "vite";
import YAML from "yaml";
import fs from "fs";

type ScreenlyManifestField = {
  type: string;
  default_value?: string;
  title: string;
  optional: boolean;
  is_global?: boolean;
  help_text: string;
};

type BaseScreenlyMockData = {
  metadata: {
    coordinates: [number, number];
    hostname: string;
    screen_name: string;
    hardware: string;
    location: string;
    screenly_version: string;
    tags: string[];
  };
  settings: {
    enable_analytics: string;
    tag_manager_id: string;
    theme: string;
    screenly_color_accent: string;
    screenly_color_light: string;
    screenly_color_dark: string;
  };
  cors_proxy_url: string;
};

const defaultScreenlyConfig = {
  metadata: {
    coordinates: [37.3861, -122.0839] as [number, number],
    hostname: "dev-hostname",
    screen_name: "Development Server",
    hardware: "x86",
    location: "Development Environment",
    screenly_version: "development-server",
    tags: ["Development"],
  },
  settings: {
    enable_analytics: "true",
    tag_manager_id: "",
    theme: "light" as const,
    screenly_color_accent: "#972EFF",
    screenly_color_light: "#ADAFBE",
    screenly_color_dark: "#454BD2",
  },
  cors_proxy_url: "http://127.0.0.1:8080",
};

function generateScreenlyObject(config: BaseScreenlyMockData) {
  return `
    // Generated screenly.js for development mode
    window.screenly = {
      signalReadyForRendering: () => {},
      metadata: ${JSON.stringify(config.metadata, null, 2)},
      settings: ${JSON.stringify(config.settings, null, 2)},
      cors_proxy_url: ${JSON.stringify(config.cors_proxy_url)}
    }
  `;
}

function generateMockData(): BaseScreenlyMockData {
  const manifest = YAML.parse(fs.readFileSync("screenly.yml", "utf8"));
  const screenlyConfig: BaseScreenlyMockData = structuredClone(
    defaultScreenlyConfig,
  );

  for (const [key, value] of Object.entries(manifest.settings) as [
    string,
    ScreenlyManifestField,
  ][]) {
    if (value.type === "string") {
      const manifestField: ScreenlyManifestField = value;
      const settingKey = key as keyof typeof screenlyConfig.settings;
      const defaultValue = manifestField?.default_value ?? "";
      screenlyConfig.settings[settingKey] = defaultValue;
    }
  }

  return screenlyConfig;
}

export function screenlyTestServer(mode: string): Plugin {
  return {
    name: "screenly-test-server",
    configureServer(server: ViteDevServer) {
      if (mode === "test") {
        const mockData = generateMockData();

        server.middlewares.use((req, res, next) => {
          if (req.url === "/screenly.js?version=1") {
            const screenlyJsContent = generateScreenlyObject(mockData);

            res.setHeader("Content-Type", "application/javascript");
            res.end(screenlyJsContent);
            return;
          }
          next();
        });
      }
    },
  };
}
