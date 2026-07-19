export const ROLE_STATUSES = [
  { value: true, labelKey: "role.statusActive" },
  { value: false, labelKey: "role.statusInactive" },
];

export function roleDisplayName(role, locale = "en") {
  if (!role) return "";
  if (locale === "ar") {
    return role.name_ar || role.display_name || role.name_en || role.name || "";
  }
  return role.name_en || role.display_name || role.name_ar || role.name || "";
}

export function emptyRoleForm() {
  return {
    name: "",
    name_en: "",
    name_ar: "",
    role_code: "",
    description: "",
    approval_limit_min: null,
    approval_limit_max: null,
    auto_approval_limit: null,
    is_active: true,
    permissions: [],
  };
}

export function roleToForm(role) {
  if (!role) return emptyRoleForm();

  return {
    name: role.name || "",
    name_en: role.name_en || "",
    name_ar: role.name_ar || "",
    role_code: role.role_code || "",
    description: role.description || "",
    approval_limit_min: role.approval_limit_min ?? null,
    approval_limit_max: role.approval_limit_max ?? null,
    auto_approval_limit: role.auto_approval_limit ?? null,
    is_active: role.is_active !== false,
    permissions: (role.permissions || []).map((p) => p.id ?? p.name).filter(Boolean),
  };
}
