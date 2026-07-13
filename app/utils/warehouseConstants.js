import { enumValue } from "~/utils/enumValue";

export const WAREHOUSE_STATUSES = [
  { value: "active", labelKey: "warehouse.statusActive" },
  { value: "inactive", labelKey: "warehouse.statusInactive" },
];

export const WAREHOUSE_TYPES = [
  { value: "main", labelKey: "warehouse.typeMain" },
  { value: "sub", labelKey: "warehouse.typeSub" },
  { value: "transit", labelKey: "warehouse.typeTransit" },
  { value: "virtual", labelKey: "warehouse.typeVirtual" },
];

export function warehouseDisplayName(warehouse, locale = "en") {
  if (!warehouse) return "";
  if (locale === "ar") {
    return warehouse.name_ar || warehouse.name_en || "";
  }
  return warehouse.name_en || warehouse.name_ar || "";
}

export function emptyWarehouseForm() {
  return {
    name_ar: "",
    name_en: "",
    branch_id: null,
    type: "main",
    manager_id: null,
    status: "active",
    location: "",
  };
}

export function warehouseToForm(warehouse) {
  if (!warehouse) return emptyWarehouseForm();

  return {
    name_ar: warehouse.name_ar || "",
    name_en: warehouse.name_en || "",
    branch_id: warehouse.branch_id ?? null,
    type: enumValue(warehouse.type) || "main",
    manager_id: warehouse.manager_id ?? null,
    status: enumValue(warehouse.status) || "active",
    location: warehouse.location || "",
  };
}
