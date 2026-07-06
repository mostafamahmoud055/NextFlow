export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore();
  const tenant = auth;

  await auth.initAuth();

  if (!tenant.hasTenant) {
    if (tenant.hasCompanies) {
      return navigateTo("/select-company");
    }

    return navigateTo("/setup");
  }

  if (!tenant?.setupCompleted) {
    return navigateTo("/setup");
  }
});
