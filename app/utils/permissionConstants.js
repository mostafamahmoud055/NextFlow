export const PERMISSION_STATUSES = [
  { value: true, labelKey: "permission.statusActive" },
  { value: false, labelKey: "permission.statusInactive" },
];

export const PERMISSION_ACTION_TYPES = [
  { value: "view", labelKey: "permission.actionView" },
  { value: "create", labelKey: "permission.actionCreate" },
  { value: "edit", labelKey: "permission.actionEdit" },
  { value: "update", labelKey: "permission.actionUpdate" },
  { value: "delete", labelKey: "permission.actionDelete" },
  { value: "manage", labelKey: "permission.actionManage" },
  { value: "activate", labelKey: "permission.actionActivate" },
  { value: "deactivate", labelKey: "permission.actionDeactivate" },
  { value: "approve", labelKey: "permission.actionApprove" },
  { value: "post", labelKey: "permission.actionPost" },
  { value: "cancel", labelKey: "permission.actionCancel" },
  { value: "attach", labelKey: "permission.actionAttach" },
  { value: "detach", labelKey: "permission.actionDetach" },
];

export const PERMISSION_MODULES = [
  "roles",
  "permissions",
  "companies",
  "tenants",
  "branches",
  "fiscal_years",
  "currencies",
  "taxes",
  "departments",
  "warehouses",
  "audit_logs",
  "users",
];

export function permissionKey(permission) {
  if (!permission) return null;
  if (typeof permission === "string") return permission;
  if (permission.key) return permission.key;
  if (permission.name && String(permission.name).includes(".")) {
    return permission.name;
  }

  const action =
    permission.action_type && typeof permission.action_type === "object"
      ? permission.action_type.value
      : permission.action_type;

  if (permission.module && action) {
    return `${permission.module}.${action}`;
  }

  return permission.name || null;
}

export function permissionDisplayName(permission, locale = "en") {
  if (!permission) return "";
  if (locale === "ar") {
    return (
      permission.name_ar ||
      permission.display_name ||
      permission.name_en ||
      permission.name ||
      ""
    );
  }
  return (
    permission.name_en ||
    permission.display_name ||
    permission.name_ar ||
    permission.name ||
    ""
  );
}
