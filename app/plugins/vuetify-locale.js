import { ar as vuetifyAr, en as vuetifyEn } from "vuetify/locale";

export default defineNuxtPlugin({
  name: "vuetify-locale",
  dependsOn: ["i18n:plugin"],
  setup(nuxtApp) {
    const i18n = nuxtApp.$i18n;

    i18n.mergeLocaleMessage("en", { $vuetify: vuetifyEn });
    i18n.mergeLocaleMessage("ar", { $vuetify: vuetifyAr });
  },
});
