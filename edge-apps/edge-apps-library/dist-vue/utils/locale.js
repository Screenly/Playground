import "../_virtual/tz.js";
import l from "../_virtual/index.js";
import { getNearestCity as i } from "../node_modules/offline-geocode-city/dist/index.esm.js";
import { getSettingWithDefault as c } from "./settings.js";
import { getMetadata as g } from "./metadata.js";
function d(t) {
  if (!t || t.length < 2 || t.endsWith("-") || !/^[a-z]{2,3}(-[a-z]{2,})*$/i.test(t))
    return !1;
  try {
    const o = new Intl.DateTimeFormat(t).resolvedOptions().locale, e = t.toLowerCase().split("-")[0], n = o.toLowerCase().split("-")[0];
    if (e !== n)
      return !1;
    const s = t.toLowerCase().split("-");
    return !(s.length > 1 && o.toLowerCase().split("-").length < s.length);
  } catch {
    return !1;
  }
}
async function L() {
  const t = c("override_locale", "");
  if (t) {
    const e = t.replaceAll("_", "-");
    if (d(e))
      return e;
    console.warn(
      `Invalid locale override: "${t}", falling back to GPS detection`
    );
  }
  const [a, r] = g().coordinates, o = (navigator?.languages?.length ? navigator.languages[0] : navigator.language) || "en";
  try {
    const n = (await i(a, r)).countryIso2.toUpperCase();
    return (l.getLocaleByAlpha2(n) || o).replace("_", "-");
  } catch (e) {
    return console.warn("Failed to get locale from coordinates, using default:", e), o;
  }
}
function w(t) {
  const [a, r] = t, o = `${Math.abs(a).toFixed(4)}°`, e = a > 0 ? "N" : "S", n = `${Math.abs(r).toFixed(4)}°`, s = r > 0 ? "E" : "W";
  return `${o} ${e}, ${n} ${s}`;
}
export {
  w as formatCoordinates,
  L as getLocale
};
//# sourceMappingURL=locale.js.map
