import { aliases, mdi } from "vuetify/iconsets/mdi";

export default defineNuxtPlugin({
  name: "vuetify-mdi-font",
  setup(nuxtApp) {
    nuxtApp.hook("vuetify:configuration", ({ vuetifyOptions }) => {
      vuetifyOptions.icons = {
        defaultSet: "mdi",
        aliases,
        sets: { mdi },
      };
    });
  },
});
