export default defineNuxtRouteMiddleware((to) => {
  const required = to.meta.permission ?? to.meta.permissions;
  if (!required) return;

  const { hasAnyPermission } = usePermissions();
  const keys = Array.isArray(required) ? required : [required];

  if (!hasAnyPermission(...keys)) {
    return navigateTo("/");
  }
});
