import { ref } from "vue";

export const settingsStoreSetup = () => {
  const settings = ref(screenly.settings);
  const primaryThemeColor = ref("");
  const secondaryThemeColor = ref("");
  const tertiaryThemeColor = ref("");
  const backgroundThemeColor = ref("");
  const brandLogoUrl = ref("");

  const setupTheme = () => {
    const tertiaryColor = "#FFFFFF";
    const backgroundColor = "#C9CDD0";
    const defaultPrimaryColor = "#972EFF";
    let secondaryColor = "#454BD2";

    const primaryColor =
      !settings.value.screenly_color_accent ||
      settings.value.screenly_color_accent.toLowerCase() === "#ffffff"
        ? defaultPrimaryColor
        : settings.value.screenly_color_accent;

    if (settings.value.theme === "light") {
      secondaryColor =
        !settings.value.screenly_color_light ||
        settings.value.screenly_color_light.toLowerCase() === "#ffffff"
          ? "#adafbe"
          : settings.value.screenly_color_light;
    } else if (settings.value.theme === "dark") {
      secondaryColor =
        !settings.value.screenly_color_dark ||
        settings.value.screenly_color_dark.toLowerCase() === "#ffffff"
          ? "#adafbe"
          : settings.value.screenly_color_dark;
    }

    document.documentElement.style.setProperty(
      "--theme-color-primary",
      primaryColor,
    );
    document.documentElement.style.setProperty(
      "--theme-color-secondary",
      secondaryColor,
    );
    document.documentElement.style.setProperty(
      "--theme-color-tertiary",
      tertiaryColor,
    );
    document.documentElement.style.setProperty(
      "--theme-color-background",
      backgroundColor,
    );

    primaryThemeColor.value = primaryColor;
    secondaryThemeColor.value = secondaryColor;
    tertiaryThemeColor.value = tertiaryColor;
    backgroundThemeColor.value = backgroundColor;
  };

  const setupBrandingLogo = async () => {
    const theme = settings.value.theme || "light";

    // Define settings
    const lightLogo = settings.value.screenly_logo_light ?? "";
    const darkLogo = settings.value.screenly_logo_dark ?? "";

    // Set logo URLs based on theme
    let logoUrl = "";
    let fallbackUrl = "";

    if (theme === "light") {
      logoUrl = lightLogo
        ? `${screenly.cors_proxy_url}/${lightLogo}`
        : `${screenly.cors_proxy_url}/${darkLogo}`;
      fallbackUrl = lightLogo || darkLogo || "";
    } else if (theme === "dark") {
      logoUrl = darkLogo
        ? `${screenly.cors_proxy_url}/${darkLogo}`
        : `${screenly.cors_proxy_url}/${lightLogo}`;
      fallbackUrl = darkLogo || lightLogo;
    }

    // Function to fetch and process the image
    const fetchImage = async (fileUrl: string): Promise<string> => {
      try {
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch image from ${fileUrl}, status: ${response.status}`,
          );
        }

        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();
        const uintArray = new Uint8Array(buffer);

        // Get the first 4 bytes for magic number detection
        const hex = Array.from(uintArray.slice(0, 4))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
          .toUpperCase();

        // Convert the first few bytes to ASCII for text-based formats like SVG
        const ascii = String.fromCharCode.apply(
          null,
          Array.from(uintArray.slice(0, 100)),
        ); // Check first 100 chars for XML/SVG tags
        const pngMagicNumber = "89504E47";
        const jpegMagicNumber = "FFD8FF";

        // Determine file type based on MIME type, magic number, or ASCII text
        if (ascii.startsWith("<?xml") || ascii.startsWith("<svg")) {
          // Convert to Base64 using FileReader like the original
          return new Promise((resolve, reject) => {
            const svgReader = new FileReader();
            svgReader.readAsText(blob);
            svgReader.onloadend = function () {
              try {
                const base64 = btoa(
                  unescape(encodeURIComponent(svgReader.result as string)),
                );
                resolve("data:image/svg+xml;base64," + base64);
              } catch (error) {
                reject(error);
              }
            };
            svgReader.onerror = () =>
              reject(new Error("Failed to read SVG file"));
          });
        } else if (hex === pngMagicNumber || hex === jpegMagicNumber) {
          // Checking PNG or JPEG/JPG magic number
          return fileUrl;
        } else {
          throw new Error("Unknown image type");
        }
      } catch (error) {
        console.error("Error fetching image:", error);
        throw error;
      }
    };

    // Try to fetch the image using the CORS proxy URL
    try {
      const processedLogoUrl = await fetchImage(logoUrl);
      brandLogoUrl.value = processedLogoUrl;
    } catch {
      // If CORS fails, try the fallback URL
      try {
        const processedFallbackUrl = await fetchImage(fallbackUrl);
        brandLogoUrl.value = processedFallbackUrl;
      } catch {
        // Set to empty string so the template uses the imported screenlyLogo
        brandLogoUrl.value = fallbackUrl ?? "";
      }
    }
  };

  return {
    settings,
    primaryThemeColor,
    secondaryThemeColor,
    tertiaryThemeColor,
    backgroundThemeColor,
    brandLogoUrl,
    setupTheme,
    setupBrandingLogo,
  };
};

export type SettingsStore = ReturnType<typeof settingsStoreSetup>;
