import QRCode from "qrcode";
import {
  setupTheme,
  addUTMParamsIf,
  getSetting,
  signalReady,
} from "@screenly/edge-apps";

interface QRCodeOptions {
  type: "svg";
  color?: {
    light?: string;
    dark?: string;
  };
  margin?: number;
}

function generateQrCode(
  url: string,
  options: QRCodeOptions,
  callback: (svgElement: SVGElement) => void,
): void {
  QRCode.toString(url, options, (err, result) => {
    if (err) throw err;

    const parser = new DOMParser();
    const svg = parser.parseFromString(result, "image/svg+xml");

    callback(svg.documentElement as unknown as SVGElement);
  });
}

window.onload = function () {
  const url = getSetting<string>("url") || "";
  const enableUtm = getSetting<string>("enable_utm") === "true";
  const headline = getSetting<string>("headline") || "";
  const callToAction = getSetting<string>("call_to_action") || "";

  // Setup branding colors using the library
  setupTheme();

  // Set the headline (main message)
  const headlineElement =
    document.querySelector<HTMLHeadingElement>("#headline");
  if (headlineElement && headline) {
    headlineElement.textContent = headline;
  }

  // Set the call to action (instruction)
  const ctaElement = document.querySelector<HTMLParagraphElement>("#cta");
  if (ctaElement && callToAction) {
    ctaElement.textContent = callToAction;
  }

  // Add UTM parameters to URL if enabled
  const finalUrl = addUTMParamsIf(url, enableUtm);

  generateQrCode(
    finalUrl,
    {
      type: "svg",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      margin: 2,
    },
    (svgElement) => {
      const container = document.querySelector("#qr-code");
      container?.appendChild(svgElement);

      // Signal that the app is ready using the library
      signalReady();
    },
  );
};
