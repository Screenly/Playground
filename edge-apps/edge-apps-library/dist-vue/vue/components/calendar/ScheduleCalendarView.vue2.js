import { defineComponent as B, ref as k, computed as p, watch as N, createElementBlock as r, openBlock as i, createElementVNode as a, createCommentVNode as g, toDisplayString as h, Fragment as E, renderList as C, normalizeStyle as w, createVNode as O } from "vue";
import S from "./EventTimeRange.vue.js";
import l from "dayjs";
import x from "dayjs/plugin/utc";
import D from "dayjs/plugin/timezone";
const I = { class: "ScheduleCalendarView primary-card" }, W = { class: "schedule-day-section" }, F = { class: "day-header" }, L = { class: "events-list" }, R = { class: "event-title" }, M = {
  key: 0,
  class: "no-events"
}, j = {
  key: 0,
  class: "schedule-day-section"
}, J = { class: "events-list" }, U = { class: "event-title" }, z = 7, Q = /* @__PURE__ */ B({
  __name: "ScheduleCalendarView",
  props: {
    timezone: { default: "UTC" },
    now: {},
    events: {},
    locale: {},
    currentDayOfWeek: {}
  },
  setup(b) {
    l.extend(x), l.extend(D);
    const t = b, d = k([]), c = k([]), A = p(() => t.currentDayOfWeek), m = p(() => t.events);
    return N([m, () => t.timezone], () => {
      const u = l().tz(t.timezone), e = u.startOf("day").add(1, "day"), o = m.value.filter((n) => {
        const s = l(n.startTime).tz(t.timezone);
        return s.isAfter(u) && s.isBefore(e);
      }), V = e.add(1, "day"), _ = m.value.filter((n) => {
        const s = l(n.startTime).tz(t.timezone);
        return s.isAfter(e) && s.isBefore(V);
      }), T = (n, s) => l(n.startTime).tz(t.timezone).valueOf() - l(s.startTime).tz(t.timezone).valueOf();
      o.sort(T), _.sort(T);
      let y, f;
      if (o.length >= z)
        y = o.slice(0, z), f = [];
      else {
        y = o;
        const n = z - o.length;
        f = _.slice(0, n);
      }
      d.value = y, c.value = f;
    }, {
      immediate: !0
    }), (u, v) => (i(), r("div", I, [
      a("div", W, [
        a("h2", F, h(A.value), 1),
        a("div", L, [
          (i(!0), r(E, null, C(d.value, (e, o) => (i(), r("div", {
            key: o,
            class: "schedule-event-block",
            style: w(
              e.backgroundColor ? { backgroundColor: e.backgroundColor } : {}
            )
          }, [
            a("div", R, h(e.title), 1),
            O(S, {
              "start-time": e.startTime,
              "end-time": e.endTime,
              locale: t.locale,
              timezone: t.timezone
            }, null, 8, ["start-time", "end-time", "locale", "timezone"])
          ], 4))), 128)),
          d.value.length === 0 ? (i(), r("div", M, " No events scheduled for today ")) : g("", !0)
        ])
      ]),
      c.value.length > 0 ? (i(), r("div", j, [
        v[0] || (v[0] = a("h2", { class: "day-header" }, "TOMORROW", -1)),
        a("div", J, [
          (i(!0), r(E, null, C(c.value, (e, o) => (i(), r("div", {
            key: o,
            class: "schedule-event-block",
            style: w(
              e.backgroundColor ? { backgroundColor: e.backgroundColor } : {}
            )
          }, [
            a("div", U, h(e.title), 1),
            O(S, {
              "start-time": e.startTime,
              "end-time": e.endTime,
              locale: t.locale,
              timezone: t.timezone
            }, null, 8, ["start-time", "end-time", "locale", "timezone"])
          ], 4))), 128))
        ])
      ])) : g("", !0)
    ]));
  }
});
export {
  Q as default
};
//# sourceMappingURL=ScheduleCalendarView.vue2.js.map
