import e from "dayjs";
import S from "dayjs/plugin/utc";
import B from "dayjs/plugin/timezone";
import C from "dayjs/plugin/isSameOrBefore";
import w from "dayjs/plugin/isSameOrAfter";
e.extend(S);
e.extend(B);
e.extend(C);
e.extend(w);
const y = (i, s, a) => {
  const o = e(i.startTime).tz(a), u = e(i.endTime).tz(a), m = e(s.startTime).tz(a), r = e(s.endTime).tz(a);
  return o.isBefore(r) && m.isBefore(u);
}, A = (i, s) => {
  if (i.length === 0) return [];
  const a = [...i].sort((r, t) => e(r.startTime).tz(s).diff(e(t.startTime).tz(s))), o = /* @__PURE__ */ new Map();
  for (let r = 0; r < a.length; r++) {
    const t = a[r];
    o.set(t, /* @__PURE__ */ new Set());
    const f = e(t.endTime).tz(s);
    for (let c = r + 1; c < a.length; c++) {
      const n = a[c];
      if (e(n.startTime).tz(s).isSameOrAfter(f)) break;
      y(t, n, s) && (o.get(t).add(n), o.has(n) || o.set(n, /* @__PURE__ */ new Set()), o.get(n).add(t));
    }
  }
  const u = /* @__PURE__ */ new Set(), m = [];
  for (const r of a) {
    if (u.has(r)) continue;
    const t = [], f = [r];
    let c = 0;
    for (; c < f.length; ) {
      const n = f[c++];
      if (u.has(n)) continue;
      u.add(n), t.push(n);
      const l = o.get(n) || /* @__PURE__ */ new Set();
      for (const d of l)
        u.has(d) || f.push(d);
    }
    t.sort((n, l) => {
      const d = e(n.startTime).tz(s).diff(e(l.startTime).tz(s));
      if (d !== 0) return d;
      const T = e(n.endTime).diff(e(n.startTime));
      return e(l.endTime).diff(e(l.startTime)) - T;
    }), m.push(t);
  }
  return m;
}, D = (i, s) => {
  const a = /* @__PURE__ */ new Map(), o = [], u = /* @__PURE__ */ new Map();
  for (const t of i) {
    const f = e(t.startTime).tz(s);
    let c = -1;
    for (let n = 0; n < o.length; n++)
      if (o[n]?.isSameOrBefore(f)) {
        c = n;
        break;
      }
    c === -1 && (c = o.length, o.push(e(0))), o[c] = e(t.endTime).tz(s), u.set(t, c);
  }
  const m = o.length, r = /* @__PURE__ */ new Map();
  for (let t = 0; t < m; t++)
    r.set(t, []);
  for (const t of i) {
    const f = u.get(t);
    f !== void 0 && r.get(f).push(t);
  }
  for (const t of i) {
    const f = e(t.startTime).tz(s), c = e(t.endTime).tz(s), n = u.get(t);
    let l = 1;
    for (let d = n + 1; d < m && !(r.get(d) || []).some((h) => {
      const g = e(h.startTime).tz(s), p = e(h.endTime).tz(s);
      return f.isBefore(p) && g.isBefore(c);
    }); d++)
      l++;
    a.set(t, {
      event: t,
      column: n,
      columnSpan: l,
      totalColumns: m
    });
  }
  return a;
}, I = (i) => `${i.startTime}|${i.endTime}|${i.title || ""}`;
export {
  D as calculateClusterLayouts,
  y as eventsOverlap,
  A as findEventClusters,
  I as getEventKey
};
//# sourceMappingURL=event-layout-utils.js.map
