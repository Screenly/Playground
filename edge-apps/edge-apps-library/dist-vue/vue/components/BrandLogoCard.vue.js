import { defineComponent as n, createElementBlock as t, openBlock as a, createElementVNode as r } from "vue";
const s = { class: "primary-card brand-logo-card" }, c = ["src"], i = /* @__PURE__ */ n({
  __name: "BrandLogoCard",
  props: {
    logoSrc: {}
  },
  setup(e) {
    return (l, o) => (a(), t("div", s, [
      r("img", {
        id: "brand-logo",
        src: e.logoSrc,
        class: "brand-logo",
        alt: "Brand Logo"
      }, null, 8, c),
      o[0] || (o[0] = r("span", { class: "info-text" }, "Powered by Screenly", -1))
    ]));
  }
});
export {
  i as default
};
//# sourceMappingURL=BrandLogoCard.vue.js.map
