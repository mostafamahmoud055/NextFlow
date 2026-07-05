function nullableString(value) {
  return value == null ? "" : String(value);
}

/** Map API company payload (onboarding or /setup/company) to the company step form. */
export function normalizeCompanyForm(source) {
  if (!source || typeof source !== "object") return null;

  return {
    name_en: nullableString(source.name_en),
    name_ar: nullableString(source.name_ar),
    commercial_name: nullableString(source.commercial_name),
    phone: nullableString(source.phone),
    email: nullableString(source.email),
    country: nullableString(source.country),
    city: nullableString(source.city),
  };
}
