import { ref as t, computed as i } from "vue";
import { getMetadata as g, getHostname as f, getScreenName as p, getLocation as u, getScreenlyVersion as l, getTags as S } from "../../utils/metadata.js";
import { formatCoordinates as h } from "../../utils/locale.js";
const N = () => {
  const e = g(), o = t(e.coordinates ?? [0, 0]), r = t(f() ?? ""), a = t(p() ?? ""), n = t(e.hardware ?? ""), s = t(u() ?? ""), c = t(l() ?? ""), m = t(S() ?? []), d = i(() => h(o.value));
  return {
    coordinates: o,
    hostname: r,
    screenName: a,
    hardware: n,
    location: s,
    screenlyVersion: c,
    tags: m,
    formattedCoordinates: d
  };
};
export {
  N as metadataStoreSetup
};
//# sourceMappingURL=metadata-store.js.map
