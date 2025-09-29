/// <reference types="vite/client" />

declare global {
  interface ScreenlySettings extends Record<string, unknown> {
    content?: string;
  }

  interface ScreenlyObject {
    signalReadyForRendering: () => void;
    settings: ScreenlySettings;
  }

  var screenly: ScreenlyObject;
}

export {};
