export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();

  await auth.initAuth();

  if (!auth.hasTenant && auth.hasCompanies) {
    return navigateTo({
      path: "/select-company",
      query: {
        redirect: to.fullPath,
      },
    });
  }
});
