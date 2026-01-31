import { defineComponent as s, createElementBlock as t, openBlock as o, createCommentVNode as a, renderSlot as c, toDisplayString as i } from "vue";
const l = { class: "primary-card" }, r = {
  key: 0,
  class: "icon-card"
}, d = {
  key: 0,
  class: "icon-card-text"
}, m = {
  key: 1,
  class: "icon-card-text"
}, _ = /* @__PURE__ */ s({
  __name: "InfoCard",
  props: {
    icon: {},
    title: {},
    value: {}
  },
  setup(e) {
    return (n, u) => (o(), t("div", l, [
      e.icon || e.title ? (o(), t("div", r, [
        c(n.$slots, "icon")
      ])) : a("", !0),
      c(n.$slots, "default", {}, () => [
        e.value ? (o(), t("span", d, i(e.value), 1)) : (o(), t("span", m, "N/A"))
      ])
    ]));
  }
});
export {
  _ as default
};
//# sourceMappingURL=InfoCard.vue.js.map
