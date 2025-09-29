<template>
  <div class="app">
    <TableDisplay
      :data="tableData"
      :title="tableTitle"
      v-if="tableData.length > 0"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import TableDisplay from "./components/TableDisplay.vue";

const tableData = ref<string[][]>([]);
const tableTitle = ref<string>("");

const parseCsv = (text: string): string[][] => {
  const lines = text.trim().split("\n");
  return lines.map((line) => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  });
};

const setupTheme = () => {
  if (typeof screenly === "undefined") return;

  const settings = screenly.settings;
  const theme = settings.theme || "light";
  const lightColor = settings.screenly_color_light || "#ffffff";
  const darkColor = settings.screenly_color_dark || "#2c3e50";

  // Determine base theme color
  let baseColor;
  if (settings.theme_color && settings.theme_color.trim()) {
    baseColor = settings.theme_color;
  } else {
    // Use light color for dark theme, dark color for light theme
    baseColor = theme === "dark" ? lightColor : darkColor;
  }

  // Generate 3 backgrounds and 3 foregrounds from the single base color
  let titleBg, headerBg, defaultBg, titleText, headerText, defaultText;

  if (theme === "dark") {
    const textLightness = 0.8; // Light text for dark backgrounds

    // Dark theme: dark backgrounds, light text
    titleBg = adjustColorHSV(
      baseColor,
      undefined,
      Math.min(0.2, hexToHSV(baseColor)[1]),
      0.1,
    ); // Title background: darkest
    headerBg = adjustColorHSV(
      baseColor,
      undefined,
      Math.min(0.15, hexToHSV(baseColor)[1]),
      0.15,
    ); // Header background: medium
    defaultBg = adjustColorHSV(
      baseColor,
      undefined,
      Math.min(0.1, hexToHSV(baseColor)[1]),
      0.2,
    ); // Default background: lightest

    titleText = adjustColorHSV(
      baseColor,
      undefined,
      Math.min(0.2, hexToHSV(baseColor)[1]),
      textLightness,
    ); // Title text: max 20% saturation
    headerText = adjustColorHSV(
      baseColor,
      undefined,
      Math.min(0.15, hexToHSV(baseColor)[1]),
      textLightness,
    ); // Header text: max 15% saturation
    defaultText = adjustColorHSV(
      baseColor,
      undefined,
      Math.min(0.1, hexToHSV(baseColor)[1]),
      textLightness,
    ); // Body text: max 10% saturation
  } else {
    const textLightness = 0.3; // Dark text for light backgrounds

    // Light theme: light backgrounds, dark text
    titleBg = adjustColorHSV(
      baseColor,
      undefined,
      Math.min(0.2, hexToHSV(baseColor)[1]),
      0.8,
    ); // Title background: 0.8 value, 20% saturation
    headerBg = adjustColorHSV(
      baseColor,
      undefined,
      Math.min(0.15, hexToHSV(baseColor)[1]),
      0.85,
    ); // Header background: medium
    defaultBg = adjustColorHSV(
      baseColor,
      undefined,
      Math.min(0.1, hexToHSV(baseColor)[1]),
      0.9,
    ); // Default background: 0.9 lightness, 10% saturation

    titleText = adjustColorHSV(
      baseColor,
      undefined,
      Math.min(0.2, hexToHSV(baseColor)[1]),
      textLightness,
    ); // Title text: max 20% saturation
    headerText = adjustColorHSV(
      baseColor,
      undefined,
      Math.min(0.15, hexToHSV(baseColor)[1]),
      textLightness,
    ); // Header text: max 15% saturation
    defaultText = adjustColorHSV(
      baseColor,
      undefined,
      Math.min(0.1, hexToHSV(baseColor)[1]),
      textLightness,
    ); // Body text: max 10% saturation
  }

  document.documentElement.style.setProperty("--theme-color-title-bg", titleBg);
  document.documentElement.style.setProperty(
    "--theme-color-header-bg",
    headerBg,
  );
  document.documentElement.style.setProperty(
    "--theme-color-default-bg",
    defaultBg,
  );
  document.documentElement.style.setProperty(
    "--theme-color-title-text",
    titleText,
  );
  document.documentElement.style.setProperty(
    "--theme-color-header-text",
    headerText,
  );
  document.documentElement.style.setProperty(
    "--theme-color-default-text",
    defaultText,
  );
};

// Helper function to convert hex to HSV
const hexToHSV = (hex: string): [number, number, number] => {
  const red = parseInt(hex.slice(1, 3), 16) / 255;
  const green = parseInt(hex.slice(3, 5), 16) / 255;
  const blue = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const diff = max - min;

  let hue = 0;
  if (diff !== 0) {
    if (max === red) hue = ((green - blue) / diff) % 6;
    else if (max === green) hue = (blue - red) / diff + 2;
    else hue = (red - green) / diff + 4;
  }
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  const saturation = max === 0 ? 0 : diff / max;
  const value = max;

  return [hue, saturation, value];
};

// Helper function to convert HSV to hex
const hsvToHex = (hue: number, saturation: number, value: number): string => {
  const chroma = value * saturation;
  const huePrime = hue / 60;
  const secondaryComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));
  const lightnessAdjustment = value - chroma;

  let red = 0,
    green = 0,
    blue = 0;
  if (hue < 60) {
    red = chroma;
    green = secondaryComponent;
    blue = 0;
  } else if (hue < 120) {
    red = secondaryComponent;
    green = chroma;
    blue = 0;
  } else if (hue < 180) {
    red = 0;
    green = chroma;
    blue = secondaryComponent;
  } else if (hue < 240) {
    red = 0;
    green = secondaryComponent;
    blue = chroma;
  } else if (hue < 300) {
    red = secondaryComponent;
    green = 0;
    blue = chroma;
  } else {
    red = chroma;
    green = 0;
    blue = secondaryComponent;
  }

  red = Math.round((red + lightnessAdjustment) * 255);
  green = Math.round((green + lightnessAdjustment) * 255);
  blue = Math.round((blue + lightnessAdjustment) * 255);

  return `#${red.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;
};

// Helper function to adjust HSV values of a color
const adjustColorHSV = (
  hex: string,
  hue?: number,
  saturation?: number,
  value?: number,
): string => {
  const [currentHue, currentSaturation, currentValue] = hexToHSV(hex);

  const newHue = hue !== undefined ? hue * 360 : currentHue;
  const newSaturation =
    saturation !== undefined ? saturation : currentSaturation;
  const newValue = value !== undefined ? value : currentValue;

  return hsvToHex(newHue, newSaturation, newValue);
};

onMounted(() => {
  setupTheme();

  // Get CSV content and title from screenly settings
  if (typeof screenly !== "undefined" && screenly.settings?.content) {
    tableData.value = parseCsv(screenly.settings.content);
    tableTitle.value = screenly.settings.title || "";
    screenly.signalReadyForRendering();
  }
});
</script>

<style scoped>
.app {
  width: 100%;
  height: 100vh;
  background-color: var(--theme-color-default-bg, #ffffff);
}
</style>
