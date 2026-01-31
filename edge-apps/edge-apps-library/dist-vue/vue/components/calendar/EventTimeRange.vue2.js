import { defineComponent as a, ref as m, watch as s, createElementBlock as c, openBlock as l, toDisplayString as u } from "vue";
const d = { class: "event-time" }, T = /* @__PURE__ */ a({
  __name: "EventTimeRange",
  props: {
    startTime: {},
    endTime: {},
    locale: {},
    timezone: {}
  },
  setup(r) {
    const e = r, o = m("");
    return s(
      [
        () => e.startTime,
        () => e.endTime,
        () => e.locale,
        () => e.timezone
      ],
      () => {
        try {
          const n = new Date(e.startTime).toLocaleTimeString(
            e.locale || "en-US",
            {
              hour: "numeric",
              minute: "2-digit",
              timeZone: e.timezone
            }
          ), t = new Date(e.endTime).toLocaleTimeString(
            e.locale || "en-US",
            {
              hour: "numeric",
              minute: "2-digit",
              timeZone: e.timezone
            }
          );
          o.value = `${n} - ${t}`;
        } catch (n) {
          console.error("Error formatting time:", n);
          const t = new Date(e.startTime), i = new Date(e.endTime);
          o.value = `${t.getHours()}:${t.getMinutes().toString().padStart(2, "0")} - ${i.getHours()}:${i.getMinutes().toString().padStart(2, "0")}`;
        }
      },
      { immediate: !0 }
    ), (n, t) => (l(), c("span", d, u(o.value), 1));
  }
});
export {
  T as default
};
//# sourceMappingURL=EventTimeRange.vue2.js.map
