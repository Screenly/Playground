import "../_virtual/tz.js";
import "../_virtual/index.js";
function n() {
  return screenly.metadata;
}
function a() {
  return screenly.metadata.screen_name;
}
function r() {
  return screenly.metadata.hostname;
}
function c() {
  return screenly.metadata.location;
}
function o() {
  return screenly.metadata.screenly_version;
}
function s() {
  return screenly.metadata.tags;
}
export {
  r as getHostname,
  c as getLocation,
  n as getMetadata,
  a as getScreenName,
  o as getScreenlyVersion,
  s as getTags
};
//# sourceMappingURL=metadata.js.map
