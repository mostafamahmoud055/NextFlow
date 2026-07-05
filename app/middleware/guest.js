export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore();

  await auth.initAuth();

  if (auth.user) {
    if (!auth.user.email_verified_at) {
      return navigateTo("/verify-email");
    }

    return navigateTo("/");
  }
});