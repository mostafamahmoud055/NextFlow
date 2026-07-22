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
  { value: "restore", labelKey: "permission.actionRestore" },
  { value: "force_delete", labelKey: "permission.actionForceDelete" },
  { value: "manage", labelKey: "permission.actionManage" },
  { value: "activate", labelKey: "permission.actionActivate" },
  { value: "deactivate", labelKey: "permission.actionDeactivate" },
  { value: "approve", labelKey: "permission.actionApprove" },
  { value: "post", labelKey: "permission.actionPost" },
  { value: "cancel", labelKey: "permission.actionCancel" },
  { value: "attach", labelKey: "permission.actionAttach" },
  { value: "detach", labelKey: "permission.actionDetach" },
  { value: "generate", labelKey: "permission.actionGenerate" },
  { value: "open", labelKey: "permission.actionOpen" },
  { value: "close", labelKey: "permission.actionClose" },
  { value: "reopen", labelKey: "permission.actionReopen" },
  { value: "archive", labelKey: "permission.actionArchive" },
  { value: "export", labelKey: "permission.actionExport" },
  { value: "view_history", labelKey: "permission.actionViewHistory" },
];

export const PERMISSION_MODULES = [
  "roles",
  "permissions",
  "companies",
  "tenants",
  "branches",
  "fiscal_years",
  "accounting_periods",
  "currencies",
  "exchange_rates",
  "taxes",
  "departments",
  "warehouses",
  "cost_centers",
  "profit_centers",
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
