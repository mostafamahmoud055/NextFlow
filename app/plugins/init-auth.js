export default defineNuxtPlugin({
  name: "init-auth",
  dependsOn: ["api"],
  async setup() {
    await useAuthStore().initAuth();
  },
});
