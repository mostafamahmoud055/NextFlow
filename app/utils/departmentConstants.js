import { enumValue } from "~/utils/enumValue";

export const DEPARTMENT_STATUSES = [
  { value: "active", labelKey: "department.statusActive" },
  { value: "inactive", labelKey: "department.statusInactive" },
];

export function departmentDisplayName(department, locale = "en") {
  if (!department) return "";
  if (locale === "ar") {
    return department.name_ar || department.name_en || department.department_code || "";
  }
  return department.name_en || department.name_ar || department.department_code || "";
}

export function emptyDepartmentForm() {
  return {
    name_ar: "",
    name_en: "",
    parent_id: null,
    branch_id: null,
    manager_id: null,
    status: "active",
  };
}

export function departmentToForm(department) {
  if (!department) return emptyDepartmentForm();

  return {
    name_ar: department.name_ar || "",
    name_en: department.name_en || "",
    parent_id: department.parent_id ?? null,
    branch_id: department.branch_id ?? null,
    manager_id: department.manager_id ?? null,
    status: enumValue(department.status) || "active",
  };
}
