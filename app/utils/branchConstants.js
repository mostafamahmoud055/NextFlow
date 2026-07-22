import { enumValue } from "~/utils/enumValue";

export const BRANCH_STATUSES = [
  { value: "active", labelKey: "branch.statusActive" },
  { value: "inactive", labelKey: "branch.statusInactive" },
];

export const BRANCH_TYPES = [
  { value: "main", labelKey: "branch.typeMain" },
  { value: "branch", labelKey: "branch.typeBranch" },
];

export function branchDisplayName(branch, locale = "en") {
  if (!branch) return "";
  if (locale === "ar") {
    return branch.name_ar || branch.name_en || "";
  }
  return branch.name_en || branch.name_ar || "";
}

export function emptyBranchForm() {
  return {
    name_ar: "",
    name_en: "",
    type: "branch",
    status: "active",
    manager_id: null,
    phone: "",
    mobile: "",
    email: "",
    country: "",
    city: "",
    address: "",
    postal_code: "",
    notes: "",
  };
}

export function branchToForm(branch) {
  if (!branch) return emptyBranchForm();

  return {
    name_ar: branch.name_ar || "",
    name_en: branch.name_en || "",
    type: enumValue(branch.type) || "branch",
    status: enumValue(branch.status) || "active",
    manager_id: branch.manager_id ?? null,
    phone: branch.phone || "",
    mobile: branch.mobile || "",
    email: branch.email || "",
    country: branch.country || "",
    city: branch.city || "",
    address: branch.address || "",
    postal_code: branch.postal_code || "",
    notes: branch.notes || "",
  };
}
