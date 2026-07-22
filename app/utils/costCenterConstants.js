import { enumValue } from "~/utils/enumValue";

export const COST_CENTER_STATUSES = [
  { value: "active", labelKey: "costCenter.statusActive" },
  { value: "inactive", labelKey: "costCenter.statusInactive" },
];

export function costCenterDisplayName(costCenter, locale = "en") {
  if (!costCenter) return "";
  if (locale === "ar") {
    return (
      costCenter.name_ar ||
      costCenter.name_en ||
      costCenter.cost_center_code ||
      ""
    );
  }
  return (
    costCenter.name_en ||
    costCenter.name_ar ||
    costCenter.cost_center_code ||
    ""
  );
}

export function emptyCostCenterForm() {
  return {
    name_ar: "",
    name_en: "",
    parent_id: null,
    department_id: null,
    branch_id: null,
    warehouse_id: null,
    manager_id: null,
    status: "active",
  };
}

export function costCenterToForm(costCenter) {
  if (!costCenter) return emptyCostCenterForm();

  return {
    name_ar: costCenter.name_ar || "",
    name_en: costCenter.name_en || "",
    parent_id: costCenter.parent_id ?? null,
    department_id: costCenter.department_id ?? null,
    branch_id: costCenter.branch_id ?? null,
    warehouse_id: costCenter.warehouse_id ?? null,
    manager_id: costCenter.manager_id ?? null,
    status: enumValue(costCenter.status) || "active",
  };
}
