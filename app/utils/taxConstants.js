import { enumValue } from "~/utils/enumValue";

export const TAX_STATUSES = [
  { value: "active", labelKey: "tax.statusActive" },
  { value: "inactive", labelKey: "tax.statusInactive" },
];

export const TAX_TYPES = [
  { value: "vat", labelKey: "tax.typeVat" },
  { value: "sales_tax", labelKey: "tax.typeSalesTax" },
  { value: "withholding_tax", labelKey: "tax.typeWithholdingTax" },
  { value: "custom", labelKey: "tax.typeCustom" },
];

export const TAX_METHODS = [
  { value: "percentage", labelKey: "tax.methodPercentage" },
  { value: "fixed", labelKey: "tax.methodFixed" },
];

export const TAX_SCOPES = [
  { value: "sales", labelKey: "tax.scopeSales" },
  { value: "purchase", labelKey: "tax.scopePurchase" },
  { value: "both", labelKey: "tax.scopeBoth" },
];

export const TAX_CALCULATION_LEVELS = [
  { value: "line", labelKey: "tax.levelLine" },
  { value: "document", labelKey: "tax.levelDocument" },
];

export function taxDisplayName(tax, locale = "en") {
  if (!tax) return "";
  if (locale === "ar") {
    return tax.name_ar || tax.name_en || "";
  }
  return tax.name_en || tax.name_ar || "";
}

export function emptyTaxForm() {
  return {
    name_ar: "",
    name_en: "",
    type: "vat",
    method: "percentage",
    rate: "",
    scope: "both",
    calculation_level: "line",
    effective_date: "",
    expiry_date: "",
    status: "active",
    notes: "",
  };
}

export function taxToForm(tax) {
  if (!tax) return emptyTaxForm();

  return {
    name_ar: tax.name_ar || "",
    name_en: tax.name_en || "",
    type: enumValue(tax.type) || "vat",
    method: enumValue(tax.method) || "percentage",
    rate: tax.rate != null ? String(tax.rate) : "",
    scope: enumValue(tax.scope) || "both",
    calculation_level: enumValue(tax.calculation_level) || "line",
    effective_date: tax.effective_date || "",
    expiry_date: tax.expiry_date || "",
    status: enumValue(tax.status) || "active",
    notes: tax.notes || "",
  };
}
