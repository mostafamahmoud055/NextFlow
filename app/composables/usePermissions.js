export function usePermissions() {
  const auth = useAuthStore();
  const permissionsStore = usePermissionsStore();

  const permissionSet = computed(() => new Set(auth.permissions));
  const inactivePermissionSet = computed(
    () => new Set(permissionsStore.inactiveKeys),
  );

  function hasPermission(key) {
    return permissionSet.value.has(key);
  }

  function hasAnyPermission(...keys) {
    return keys.some((key) => permissionSet.value.has(key));
  }

  function isPermissionEnforced(key) {
    return !inactivePermissionSet.value.has(key);
  }

  /**
   * Active permissions require ownership.
   * If any required permission is deactivated, access is open to everyone.
   */
  function canAccessPermission(...keys) {
    const required = keys.filter(Boolean);
    if (!required.length) return true;

    if (required.some((key) => !isPermissionEnforced(key))) {
      return true;
    }

    return hasAnyPermission(...required);
  }

  async function ensureInactivePermissions(force = false) {
    return permissionsStore.fetchInactiveKeys(force);
  }

  function hasRole(name) {
    return auth.roles.some((role) => role.name === name);
  }

  return {
    permissions: computed(() => auth.permissions),
    roles: computed(() => auth.roles),
    hasPermission,
    hasAnyPermission,
    canAccessPermission,
    isPermissionEnforced,
    ensureInactivePermissions,
    hasRole,
  };
}
