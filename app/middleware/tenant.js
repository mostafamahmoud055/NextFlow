export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore();

  await auth.initAuth();

  if (!auth.hasTenant && auth.hasCompanies) {
    return navigateTo("/select-company");
  }
});
