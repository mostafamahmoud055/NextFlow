export function usePermissions() {
    const auth = useAuthStore();

    const permissionSet = computed(() => new Set(auth.permissions));

    function hasPermission(key) {
        return permissionSet.value.has(key);
    }

    function hasAnyPermission(...keys) {
        return keys.some((key) => permissionSet.value.has(key));
    }

    function hasRole(name) {
        return auth.roles.some((role) => role.name === name);
    }

    return {
        permissions: computed(() => auth.permissions),
        roles: computed(() => auth.roles),
        hasPermission,
        hasAnyPermission,
        hasRole,
    };
}
