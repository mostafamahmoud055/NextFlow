export const USER_STATUSES = [
  { value: "active", labelKey: "user.statusActive" },
  { value: "inactive", labelKey: "user.statusInactive" },
];

export const USER_LOGIN_STATUSES = [
  { value: "unlocked", labelKey: "user.loginUnlocked" },
  { value: "locked", labelKey: "user.loginLocked" },
];

export function userDisplayName(user, locale = "en") {
  if (!user) return "";
  if (locale === "ar") {
    return user.name_ar || user.display_name || user.name_en || "";
  }
  return user.name_en || user.display_name || user.name_ar || "";
}

export function emptyUserForm() {
  return {
    name_en: "",
    name_ar: "",
    email: "",
    password: "",
    status: "active",
    login_status: "unlocked",
    roles: [],
  };
}

export function userToForm(user) {
  if (!user) return emptyUserForm();

  return {
    name_en: user.name_en || "",
    name_ar: user.name_ar || "",
    email: user.email || "",
    password: "",
    status: user.status || "active",
    login_status: user.login_status || "unlocked",
    roles: (user.roles || []).map((role) => role.id).filter(Boolean),
  };
}

export function userRoleNames(user, locale = "en") {
  const roles = user?.roles || [];
  if (!roles.length) return "";

  return roles
    .map((role) => {
      if (locale === "ar") {
        return role.name_ar || role.display_name || role.name_en || role.name;
      }
      return role.name_en || role.display_name || role.name_ar || role.name;
    })
    .filter(Boolean)
    .join(", ");
}
