export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();

  await auth.initAuth();
  if (auth.user && auth.user.email_verified_at && to.path === "/verify-email") {
    return navigateTo("/");
  }
  
  if (!auth.user || auth.user.email_verified_at) {
    return;
  }

  if (to.path === "/verify-email") {
    return;
  }

  return navigateTo("/verify-email");
});