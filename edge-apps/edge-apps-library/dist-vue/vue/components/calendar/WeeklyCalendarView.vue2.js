import { defineComponent as re, ref as B, computed as p, watch as M, createElementBlock as d, openBlock as h, createElementVNode as c, toDisplayString as k, Fragment as T, renderList as $, normalizeClass as ae, createCommentVNode as se, normalizeStyle as L, createVNode as ie } from "vue";
import v from "dayjs";
import le from "dayjs/plugin/utc";
import ue from "dayjs/plugin/timezone";
import ce from "./EventTimeRange.vue.js";
import { findEventClusters as me, calculateClusterLayouts as de, getEventKey as U } from "../../utils/event-layout-utils.js";
import he from "dayjs/plugin/isSameOrBefore";
import ve from "dayjs/plugin/isSameOrAfter";
const pe = { class: "primary-card weekly-view" }, fe = {
  key: 0,
  class: "weekly-calendar"
}, ye = {
  key: 1,
  class: "weekly-calendar"
}, ge = { class: "month-year-header" }, we = { class: "week-header" }, Se = { class: "week-body" }, De = { class: "time-label" }, ke = { class: "event-title" }, Le = /* @__PURE__ */ re({
  __name: "WeeklyCalendarView",
  props: {
    timezone: { default: "UTC" },
    now: {},
    events: {},
    locale: {}
  },
  setup(Y) {
    v.extend(le), v.extend(ue), v.extend(he), v.extend(ve);
    const s = Y, _ = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], i = B([]), C = B(!1), m = p(() => s.now), S = p(() => s.events), z = p(() => {
      const t = parseInt(
        new Date(m.value).toLocaleString("en-US", {
          hour: "numeric",
          hour12: !1,
          timeZone: s.timezone
        })
      );
      return {
        current: t,
        start: t - 1,
        windowStart: (t - 2 + 24) % 24
      };
    }), x = p(() => {
      const t = new Date(m.value), e = t.getDay();
      return t.setDate(t.getDate() - e), t.setHours(0, 0, 0, 0), t;
    }), A = p(() => {
      if (!S.value || i.value.length === 0) return /* @__PURE__ */ new Map();
      const t = /* @__PURE__ */ new Map(), e = i.value.map((l) => l.hour), o = Math.min(...e), n = Math.max(...e), a = z.value.current > 12;
      return S.value.forEach((l) => {
        const u = new Date(l.startTime), g = parseInt(
          u.toLocaleString("en-US", {
            hour: "numeric",
            hour12: !1,
            timeZone: s.timezone
          })
        ), D = u.toLocaleString("en-US", {
          weekday: "long",
          timeZone: s.timezone
        }), w = _.findIndex(
          (y) => y.toLowerCase().startsWith(D.toLowerCase().slice(0, 3))
        );
        if (w >= 0 && w < 7 && g >= o && g <= n && (!a || g !== 0)) {
          const y = `${w}-${g}`;
          t.has(y) || t.set(y, []), t.get(y).push(l);
        }
      }), t;
    }), N = p(() => {
      const t = /* @__PURE__ */ new Map(), e = /* @__PURE__ */ new Map();
      S.value.filter((n) => {
        const r = v(n.startTime).tz(s.timezone), a = v(x.value).tz(s.timezone);
        return !r.isBefore(a) && r.isBefore(a.add(7, "day"));
      }).forEach((n) => {
        const r = v(n.startTime).tz(s.timezone), a = v(x.value).tz(s.timezone), u = r.diff(a, "day") % 7;
        e.has(u) || e.set(u, []), e.get(u).push(n);
      });
      for (let n = 0; n < 7; n++) {
        const r = e.get(n) || [];
        if (r.length === 0) continue;
        const a = me(r, s.timezone);
        for (const l of a) {
          const u = de(l, s.timezone);
          for (const [g, D] of u)
            t.set(U(g), D);
        }
      }
      return t;
    }), O = (t) => {
      const e = N.value.get(U(t));
      return e ? {
        index: e.column,
        total: e.totalColumns,
        span: e.columnSpan
      } : { index: 0, total: 1, span: 1 };
    }, R = async () => {
      try {
        const t = s.locale, e = [], o = z.value.current;
        let n;
        o > 12 ? n = 13 : n = o;
        for (let r = 0; r < 12; r++) {
          const a = (n + r) % 24, l = new Date(m.value);
          l.setHours(a, 0, 0, 0);
          const u = l.toLocaleTimeString(t, {
            hour: "numeric",
            minute: "2-digit"
          });
          e.push({
            time: u,
            hour: a
          });
        }
        i.value = e, C.value = !0;
      } catch (t) {
        console.error("Error generating time slots:", t);
        const e = [], o = z.value.current;
        let n;
        o > 12 ? n = 13 : n = o;
        for (let r = 0; r < 12; r++) {
          const a = (n + r) % 24, l = a === 0 ? 12 : a % 12 || 12, u = a < 12 ? "AM" : "PM";
          e.push({
            time: `${l}:00 ${u}`,
            hour: a
          });
        }
        i.value = e, C.value = !0;
      }
    }, J = (t, e) => {
      const o = `${e}-${t}`;
      return A.value.get(o) || [];
    }, K = (t) => {
      const e = new Date(x.value);
      return e.setDate(e.getDate() + t), e.getDate();
    }, Z = (t) => {
      const e = new Date(x.value);
      e.setDate(e.getDate() + t);
      const o = new Date(m.value);
      return e.getDate() === o.getDate() && e.getMonth() === o.getMonth() && e.getFullYear() === o.getFullYear();
    }, f = /* @__PURE__ */ new Map(), P = (t) => {
      const e = O(t), o = `wrapper-${t.startTime}-${t.endTime}-${e.index}-${e.total}`;
      if (f.has(o))
        return f.get(o);
      const n = v(t.startTime).tz(s.timezone), r = v(t.endTime).tz(s.timezone), a = n.minute(), l = a === 0 ? 50 : a / 60 * 100 + 50, D = r.diff(n, "minute", !0) / 60 * 100, w = i.value[i.value.length - 1]?.hour || 23;
      let b;
      r.date() !== n.date() ? b = (24 - n.hour()) * 100 : b = (w - n.hour()) * 100;
      const y = Math.min(D, b), Q = Math.max(y - 4, y * 0.9), I = 100 / e.total, W = e.span && e.span > 0 ? e.span : 1, X = I * W, ee = e.index * I, te = e.index + W >= e.total ? 0 : I * 0.7, ne = X + te, oe = 2 + e.index, V = r.hour(), H = {
        top: `${l}%`,
        height: `${Q}%`,
        width: `${ne}%`,
        left: `${ee}%`,
        "z-index": `${oe}`
      };
      if ((V >= w || r.date() !== n.date() && i.value[0] && V < i.value[0].hour) && (H["border-bottom-left-radius"] = "0", H["border-bottom-right-radius"] = "0"), f.set(o, H), f.size > 100) {
        const F = f.keys().next().value;
        F && f.delete(F);
      }
      return H;
    }, j = (t) => t.backgroundColor ? { "background-color": t.backgroundColor } : {};
    M(
      S,
      () => {
        f.clear();
      },
      { deep: !0 }
    );
    const G = p(() => {
      if (!s.locale) return "";
      try {
        const o = new Date(m.value).toLocaleDateString(s.locale, {
          month: "long",
          year: "numeric"
        }).split(" "), n = o[0], r = o[1];
        if (!n || !r)
          throw new Error("Invalid month/year format");
        return `${n.toUpperCase()} ${r}`;
      } catch (t) {
        console.error("Error formatting month/year:", t);
        const e = new Date(m.value), o = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December"
        ], n = e.getMonth(), r = o[n];
        if (!r)
          throw new Error(`Invalid month index: ${n}`);
        return `${r.toUpperCase()} ${e.getFullYear()}`;
      }
    }), E = p(() => {
      if (i.value.length === 0) return 0;
      const t = parseInt(
        m.value.toLocaleString("en-US", {
          hour: "numeric",
          hour12: !1,
          timeZone: s.timezone
        })
      ), e = m.value.getMinutes(), o = i.value.findIndex(
        (a) => a.hour === t
      );
      if (o === -1) return -1;
      const n = (e + 30) / 60, r = (o + n) / i.value.length * 100;
      return Math.max(0, Math.min(100, r));
    }), q = p(() => E.value >= 0 && E.value <= 100);
    return M(
      [S, i],
      () => {
        f.clear();
      },
      { deep: !0 }
    ), M([m, () => s.timezone, z], R, {
      immediate: !0
    }), M(
      m,
      () => {
      },
      { immediate: !0 }
    ), (t, e) => (h(), d("div", pe, [
      !C.value || i.value.length === 0 ? (h(), d("div", fe, [...e[0] || (e[0] = [
        c("div", { style: { padding: "2rem", "text-align": "center" } }, "Loading calendar...", -1)
      ])])) : (h(), d("div", ye, [
        c("div", ge, k(G.value), 1),
        c("div", we, [
          e[1] || (e[1] = c("div", { class: "time-label-spacer" }, null, -1)),
          (h(), d(T, null, $(_, (o, n) => c("div", {
            key: o,
            class: "day-header"
          }, [
            c("span", null, k(o), 1),
            c("span", {
              class: ae({ "current-date": Z(n) })
            }, k(K(n)), 3)
          ])), 64))
        ]),
        c("div", Se, [
          (h(!0), d(T, null, $(i.value, (o) => (h(), d("div", {
            key: o.hour,
            class: "week-row"
          }, [
            c("div", De, k(o.time), 1),
            (h(), d(T, null, $(_, (n, r) => c("div", {
              key: `${r}-${o.hour}`,
              class: "day-column"
            }, [
              e[2] || (e[2] = c("div", { class: "hour-line" }, null, -1)),
              (h(!0), d(T, null, $(J(o.hour, r), (a) => (h(), d("div", {
                key: a.startTime,
                class: "calendar-event-wrapper",
                style: L(P(a))
              }, [
                c("div", {
                  class: "calendar-event-item",
                  style: L(j(a))
                }, [
                  c("div", ke, k(a.title), 1),
                  ie(ce, {
                    "start-time": a.startTime,
                    "end-time": a.endTime,
                    locale: s.locale,
                    timezone: s.timezone
                  }, null, 8, ["start-time", "end-time", "locale", "timezone"])
                ], 4)
              ], 4))), 128))
            ])), 64))
          ]))), 128)),
          q.value ? (h(), d("div", {
            key: 0,
            class: "current-time-indicator",
            style: L({ top: `${E.value}%` })
          }, null, 4)) : se("", !0)
        ])
      ]))
    ]));
  }
});
export {
  Le as default
};
//# sourceMappingURL=WeeklyCalendarView.vue2.js.map
