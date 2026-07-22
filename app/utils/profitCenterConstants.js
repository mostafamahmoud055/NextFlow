import { enumValue } from "~/utils/enumValue";

export const PROFIT_CENTER_STATUSES = [
  { value: "active", labelKey: "profitCenter.statusActive" },
  { value: "inactive", labelKey: "profitCenter.statusInactive" },
];

export function profitCenterDisplayName(profitCenter, locale = "en") {
  if (!profitCenter) return "";
  if (locale === "ar") {
    return (
      profitCenter.name_ar ||
      profitCenter.name_en ||
      profitCenter.profit_center_code ||
      ""
    );
  }
  return (
    profitCenter.name_en ||
    profitCenter.name_ar ||
    profitCenter.profit_center_code ||
    ""
  );
}

export function emptyProfitCenterForm() {
  return {
    name_ar: "",
    name_en: "",
    parent_id: null,
    department_id: null,
    branch_id: null,
    product_category_id: null,
    manager_id: null,
    status: "active",
  };
}

export function profitCenterToForm(profitCenter) {
  if (!profitCenter) return emptyProfitCenterForm();

  return {
    name_ar: profitCenter.name_ar || "",
    name_en: profitCenter.name_en || "",
    parent_id: profitCenter.parent_id ?? null,
    department_id: profitCenter.department_id ?? null,
    branch_id: profitCenter.branch_id ?? null,
    product_category_id: profitCenter.product_category_id ?? null,
    manager_id: profitCenter.manager_id ?? null,
    status: enumValue(profitCenter.status) || "active",
  };
}
