import { defineComponent as Q, ref as $, computed as m, watch as T, createElementBlock as d, openBlock as p, createElementVNode as f, createCommentVNode as X, Fragment as k, renderList as E, toDisplayString as b, normalizeStyle as H, createVNode as Y } from "vue";
import tt from "./EventTimeRange.vue.js";
import { findEventClusters as et, calculateClusterLayouts as nt } from "../../utils/event-layout-utils.js";
import i from "dayjs";
import ot from "dayjs/plugin/utc";
import rt from "dayjs/plugin/timezone";
import st from "dayjs/plugin/isSameOrBefore";
import at from "dayjs/plugin/isSameOrAfter";
const it = { class: "primary-card" }, lt = {
  key: 0,
  class: "daily-calendar"
}, ut = {
  key: 1,
  class: "daily-calendar"
}, ct = { class: "time-label" }, mt = { class: "time-content" }, dt = { class: "event-title" }, Mt = /* @__PURE__ */ Q({
  __name: "DailyCalendarView",
  props: {
    timezone: { default: "UTC" },
    now: {},
    events: {},
    locale: {}
  },
  setup(I) {
    i.extend(ot), i.extend(rt), i.extend(st), i.extend(at);
    const s = I, l = $([]), g = $(!1), u = m(() => s.now), h = m(() => s.events), z = m(() => {
      const e = parseInt(
        new Date(u.value).toLocaleString("en-US", {
          hour: "numeric",
          hour12: !1,
          timeZone: s.timezone
        })
      );
      return {
        current: e,
        start: e - 1,
        windowStart: (e - 2 + 24) % 24
      };
    }), V = m(() => {
      if (!h.value) return /* @__PURE__ */ new Map();
      const e = /* @__PURE__ */ new Map(), t = i(u.value).tz(s.timezone);
      return h.value.forEach((r) => {
        const o = i(r.startTime).tz(s.timezone);
        if (o.isSame(t, "day")) {
          const n = o.hour();
          e.has(n) || e.set(n, []), e.get(n).push(r);
        }
      }), e;
    }), D = m(() => {
      const e = F.value;
      if (e.length === 0) return /* @__PURE__ */ new Map();
      const t = /* @__PURE__ */ new Map(), r = et(e, s.timezone);
      for (const o of r) {
        const n = nt(o, s.timezone);
        for (const [a, c] of n)
          t.set(a, c);
      }
      return t;
    }), B = (e) => {
      const t = D.value.get(e);
      return t ? {
        index: t.column,
        total: t.totalColumns,
        span: t.columnSpan
      } : { index: 0, total: 1, span: 1 };
    }, R = async () => {
      try {
        const e = s.locale, t = [], r = z.value.current;
        let o;
        r > 12 ? o = 13 : o = r;
        for (let n = 0; n < 12; n++) {
          const a = (o + n) % 24, c = new Date(u.value);
          c.setHours(a, 0, 0, 0);
          const y = c.toLocaleTimeString(e, {
            hour: "numeric",
            minute: "2-digit"
          });
          t.push({
            time: y,
            hour: a
          });
        }
        l.value = t, g.value = !0;
      } catch (e) {
        console.error("Error generating time slots:", e);
        const t = [], r = z.value.current;
        let o;
        r > 12 ? o = 13 : o = r;
        for (let n = 0; n < 12; n++) {
          const a = (o + n) % 24, c = a === 0 ? 12 : a % 12 || 12, y = a < 12 ? "AM" : "PM";
          t.push({
            time: `${c}:00 ${y}`,
            hour: a
          });
        }
        l.value = t, g.value = !0;
      }
    }, A = (e) => V.value.get(e) || [], F = m(() => {
      const e = i(u.value).tz(s.timezone);
      return h.value.filter((t) => i(t.startTime).tz(s.timezone).isSame(e, "day"));
    }), v = /* @__PURE__ */ new Map(), N = (e) => {
      const t = B(e), r = `wrapper-${e.startTime}-${e.endTime}-${t.index}-${t.total}`;
      if (v.has(r))
        return v.get(r);
      const o = i(e.startTime).tz(s.timezone), n = i(e.endTime).tz(s.timezone), a = o.minute(), c = a === 0 ? 50 : a / 60 * 100 + 50, U = n.diff(o, "minute", !0) / 60 * 100, W = l.value[l.value.length - 1]?.hour || 23;
      let w;
      n.date() !== o.date() ? w = (24 - o.hour()) * 100 : w = (W - o.hour()) * 100;
      const M = Math.min(U, w), j = Math.max(M - 4, M * 0.9), x = 100 / t.total, _ = t.span && t.span > 0 ? t.span : 1, G = x * _, K = t.index * x, Z = t.index + _ >= t.total ? 0 : x * 0.7, J = G + Z, q = 2 + t.index, C = {
        top: `${c}%`,
        height: `${j}%`,
        width: `${J}%`,
        left: `${K}%`,
        "z-index": `${q}`
      };
      if (v.set(r, C), v.size > 100) {
        const L = v.keys().next().value;
        L && v.delete(L);
      }
      return C;
    }, O = (e) => e.backgroundColor ? { "background-color": e.backgroundColor } : {};
    T(
      h,
      () => {
        v.clear();
      },
      { deep: !0 }
    );
    const S = m(() => {
      if (l.value.length === 0) return 0;
      const e = parseInt(
        u.value.toLocaleString("en-US", {
          hour: "numeric",
          hour12: !1,
          timeZone: s.timezone
        })
      ), t = u.value.getMinutes(), r = l.value.findIndex(
        (a) => a.hour === e
      );
      if (r === -1) return -1;
      const o = (t + 45) / 60, n = (r + o) / l.value.length * 100;
      return Math.max(0, Math.min(100, n));
    }), P = m(() => S.value >= 0 && S.value <= 100);
    return T([u, () => s.timezone, z], R, {
      immediate: !0
    }), T(
      u,
      () => {
      },
      { immediate: !0 }
    ), (e, t) => (p(), d("div", it, [
      !g.value || l.value.length === 0 ? (p(), d("div", lt, [...t[0] || (t[0] = [
        f("div", { style: { padding: "2rem", "text-align": "center" } }, "Loading calendar...", -1)
      ])])) : (p(), d("div", ut, [
        (p(!0), d(k, null, E(l.value, (r, o) => (p(), d("div", {
          key: o,
          class: "time-slot"
        }, [
          f("div", ct, b(r.time), 1),
          f("div", mt, [
            t[1] || (t[1] = f("div", { class: "hour-line" }, null, -1)),
            (p(!0), d(k, null, E(A(r.hour), (n, a) => (p(), d("div", {
              key: a,
              class: "calendar-event-wrapper",
              style: H(N(n))
            }, [
              f("div", {
                class: "calendar-event-item",
                style: H(O(n))
              }, [
                f("div", dt, b(n.title), 1),
                f("div", null, [
                  Y(tt, {
                    "start-time": n.startTime,
                    "end-time": n.endTime,
                    locale: s.locale,
                    timezone: s.timezone
                  }, null, 8, ["start-time", "end-time", "locale", "timezone"])
                ])
              ], 4)
            ], 4))), 128))
          ])
        ]))), 128)),
        P.value ? (p(), d("div", {
          key: 0,
          class: "current-time-indicator",
          style: H({ top: `${S.value}%` })
        }, null, 4)) : X("", !0)
      ]))
    ]));
  }
});
export {
  Mt as default
};
//# sourceMappingURL=DailyCalendarView.vue2.js.map
