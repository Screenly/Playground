import { defineComponent as T, ref as y, onMounted as C, onUnmounted as I, createElementBlock as c, openBlock as f, createElementVNode as n, Fragment as U, renderList as k, normalizeStyle as i } from "vue";
const w = { class: "clock-container" }, F = { class: "clock" }, z = { class: "seconds-bar" }, x = { class: "hands-box" }, D = /* @__PURE__ */ T({
  __name: "AnalogClock",
  props: {
    timezone: { default: "UTC" },
    locale: { default: "en" }
  },
  setup(p) {
    const g = p, l = y(/* @__PURE__ */ new Date());
    let s = null, a = 0;
    const m = (t) => {
      t - a >= 1e3 && (l.value = /* @__PURE__ */ new Date(), a = t), s = requestAnimationFrame(m);
    }, h = (t, e) => {
      try {
        const v = new Intl.DateTimeFormat("en-US", {
          timeZone: e,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: !1
        }).formatToParts(t), r = {};
        return v.forEach((d) => {
          d.type !== "literal" && (r[d.type] = d.value);
        }), {
          hours: parseInt(r.hour || "0"),
          minutes: parseInt(r.minute || "0"),
          seconds: parseInt(r.second || "0")
        };
      } catch (o) {
        return console.warn(`Invalid timezone: ${e}, using UTC`, o), {
          hours: t.getUTCHours(),
          minutes: t.getUTCMinutes(),
          seconds: t.getUTCSeconds()
        };
      }
    }, u = (t) => {
      const e = h(l.value, g.timezone);
      switch (t) {
        case "hour":
          return e.hours * 30 + e.minutes / 2;
        case "minute":
          return e.minutes * 6;
        case "second":
          return e.seconds * 6;
        default:
          return 0;
      }
    };
    return C(() => {
      l.value = /* @__PURE__ */ new Date(), a = performance.now(), s = requestAnimationFrame(m);
    }), I(() => {
      s && cancelAnimationFrame(s);
    }), (t, e) => (f(), c("div", w, [
      n("div", F, [
        n("div", z, [
          (f(), c(U, null, k(60, (o) => n("span", {
            key: o,
            style: i({ "--index": o })
          }, [...e[0] || (e[0] = [
            n("p", null, null, -1)
          ])], 4)), 64))
        ]),
        e[4] || (e[4] = n("div", { class: "number-hours" }, null, -1)),
        n("div", x, [
          n("div", {
            class: "hand hour",
            style: i({ transform: `rotate(${u("hour")}deg)` })
          }, [...e[1] || (e[1] = [
            n("i", null, null, -1)
          ])], 4),
          n("div", {
            class: "hand minute",
            style: i({ transform: `rotate(${u("minute")}deg)` })
          }, [...e[2] || (e[2] = [
            n("i", null, null, -1)
          ])], 4),
          n("div", {
            class: "hand second",
            style: i({ transform: `rotate(${u("second")}deg)` })
          }, [...e[3] || (e[3] = [
            n("i", null, null, -1)
          ])], 4)
        ])
      ])
    ]));
  }
});
export {
  D as default
};
//# sourceMappingURL=AnalogClock.vue2.js.map
