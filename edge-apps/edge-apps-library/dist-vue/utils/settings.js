function r() {
  return screenly.settings;
}
function s(e) {
  return screenly.settings[e];
}
function i(e, n) {
  const t = screenly.settings[e];
  return t === void 0 || typeof t == "string" && t === "" ? n : t;
}
function g() {
  return screenly.settings.theme;
}
function o() {
  return screenly.cors_proxy_url;
}
export {
  o as getCorsProxyUrl,
  s as getSetting,
  i as getSettingWithDefault,
  r as getSettings,
  g as getTheme
};
//# sourceMappingURL=settings.js.map
