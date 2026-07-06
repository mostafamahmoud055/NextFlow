export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();

  await auth.initAuth();

  if (!auth.user) {
    return navigateTo("/signin");
  }

  if (!auth.user.email_verified_at && to.path !== "/verify-email") {
    return navigateTo("/verify-email");
  }

  if (auth.user.email_verified_at && to.path === "/verify-email") {
    return navigateTo("/");
  }
});
