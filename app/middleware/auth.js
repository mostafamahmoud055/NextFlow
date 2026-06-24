export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore();

  await auth.initAuth();

  if (!auth.user) {
    return navigateTo("/signin");
  }
});
