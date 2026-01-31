import { ref as c } from "vue";
import { getSettings as U, getTheme as E, getCorsProxyUrl as P, getSettingWithDefault as m } from "../../utils/settings.js";
const B = () => {
  const _ = c(U()), y = c(""), h = c(""), p = c(""), C = c(""), f = c("");
  return {
    settings: _,
    primaryThemeColor: y,
    secondaryThemeColor: h,
    tertiaryThemeColor: p,
    backgroundThemeColor: C,
    brandLogoUrl: f,
    setupTheme: () => {
      const l = "#FFFFFF", t = "#C9CDD0", r = "#972EFF";
      let o = "#454BD2";
      const n = m(
        "screenly_color_accent",
        ""
      ), a = !n || n.toLowerCase() === "#ffffff" ? r : n, i = E();
      if (i === "light") {
        const e = m(
          "screenly_color_light",
          ""
        );
        o = !e || e.toLowerCase() === "#ffffff" ? "#adafbe" : e;
      } else if (i === "dark") {
        const e = m(
          "screenly_color_dark",
          ""
        );
        o = !e || e.toLowerCase() === "#ffffff" ? "#adafbe" : e;
      }
      document.documentElement.style.setProperty(
        "--theme-color-primary",
        a
      ), document.documentElement.style.setProperty(
        "--theme-color-secondary",
        o
      ), document.documentElement.style.setProperty(
        "--theme-color-tertiary",
        l
      ), document.documentElement.style.setProperty(
        "--theme-color-background",
        t
      ), y.value = a, h.value = o, p.value = l, C.value = t;
    },
    setupBrandingLogo: async () => {
      const l = E() || "light", t = P(), r = m("screenly_logo_light", ""), o = m("screenly_logo_dark", "");
      let n = "", a = "";
      l === "light" ? (n = r ? `${t}/${r}` : `${t}/${o}`, a = r || o || "") : l === "dark" && (n = o ? `${t}/${o}` : `${t}/${r}`, a = o || r);
      const i = async (e) => {
        try {
          const s = await fetch(e);
          if (!s.ok)
            throw new Error(
              `Failed to fetch image from ${e}, status: ${s.status}`
            );
          const b = await s.blob(), $ = await b.arrayBuffer(), w = new Uint8Array($), F = Array.from(w.slice(0, 4)).map((d) => d.toString(16).padStart(2, "0")).join("").toUpperCase(), k = String.fromCharCode.apply(
            null,
            Array.from(w.slice(0, 100))
          ), L = "89504E47", S = "FFD8FF";
          if (k.startsWith("<?xml") || k.startsWith("<svg"))
            return new Promise((d, v) => {
              const g = new FileReader();
              g.readAsText(b), g.onloadend = function() {
                try {
                  const u = btoa(
                    unescape(encodeURIComponent(g.result))
                  );
                  d("data:image/svg+xml;base64," + u);
                } catch (u) {
                  v(u);
                }
              }, g.onerror = () => v(new Error("Failed to read SVG file"));
            });
          if (F === L || F === S)
            return e;
          throw new Error("Unknown image type");
        } catch (s) {
          throw console.error("Error fetching image:", s), s;
        }
      };
      try {
        const e = await i(n);
        f.value = e;
      } catch {
        try {
          const e = await i(a);
          f.value = e;
        } catch {
          f.value = a ?? "";
        }
      }
    }
  };
};
export {
  B as baseSettingsStoreSetup
};
//# sourceMappingURL=base-settings-store.js.map
