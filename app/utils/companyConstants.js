import { enumValue } from "~/utils/enumValue";

export const COMPANY_STATUSES = [
  { value: "active", labelKey: "company.statusActive" },
  { value: "inactive", labelKey: "company.statusInactive" },
];

export function companyDisplayName(company, locale = "en") {
  if (!company) return "";
  if (locale === "ar") {
    return company.name_ar || company.name_en || company.commercial_name || "";
  }
  return company.name_en || company.name_ar || company.commercial_name || "";
}

export function emptyCompanyForm() {
  return {
    name_ar: "",
    name_en: "",
    commercial_name: "",
    registration_number: "",
    tax_number: "",
    phone: "",
    email: "",
    website: "",
    country: "",
    city: "",
    address: "",
    postal_code: "",
  };
}

export function companyToForm(company) {
  if (!company) return emptyCompanyForm();

  return {
    name_ar: company.name_ar || "",
    name_en: company.name_en || "",
    commercial_name: company.commercial_name || "",
    registration_number: company.registration_number || "",
    tax_number: company.tax_number || "",
    phone: company.phone || "",
    email: company.email || "",
    website: company.website || "",
    country: company.country || "",
    city: company.city || "",
    address: company.address || "",
    postal_code: company.postal_code || "",
  };
}
