declare global {
  interface Window {
    screenly?: {
      settings: {
        theme: string;
        theme_color: string;
        screenly_color_light: string;
        screenly_color_dark: string;
        content: string;
        title: string;
      };
      signalReadyForRendering: () => void;
    };
  }

  const screenly: {
    settings: {
      theme: string;
      theme_color: string;
      screenly_color_light: string;
      screenly_color_dark: string;
      content: string;
      title: string;
    };
    signalReadyForRendering: () => void;
  } | undefined;
}

export {};