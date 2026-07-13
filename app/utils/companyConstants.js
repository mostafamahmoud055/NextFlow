import { enumValue } from "~/utils/enumValue";

export const COMPANY_STATUSES = [
  { value: "active", labelKey: "company.statusActive" },
  { value: "inactive", labelKey: "company.statusInactive" },
];

export const COMPANY_CURRENCIES = [
  { value: "EGP", labelEn: "Egyptian Pound", labelAr: "جنيه مصري" },
  { value: "SAR", labelEn: "Saudi Riyal", labelAr: "ريال سعودي" },
  { value: "AED", labelEn: "UAE Dirham", labelAr: "درهم إماراتي" },
  { value: "KWD", labelEn: "Kuwaiti Dinar", labelAr: "دينار كويتي" },
  { value: "QAR", labelEn: "Qatari Riyal", labelAr: "ريال قطري" },
  { value: "BHD", labelEn: "Bahraini Dinar", labelAr: "دينار بحريني" },
  { value: "OMR", labelEn: "Omani Rial", labelAr: "ريال عُماني" },
  { value: "JOD", labelEn: "Jordanian Dinar", labelAr: "دينار أردني" },
  { value: "LBP", labelEn: "Lebanese Pound", labelAr: "ليرة لبنانية" },
  { value: "IQD", labelEn: "Iraqi Dinar", labelAr: "دينار عراقي" },
  { value: "YER", labelEn: "Yemeni Rial", labelAr: "ريال يمني" },
  { value: "ILS", labelEn: "Israeli Shekel", labelAr: "شيكل" },
  { value: "MAD", labelEn: "Moroccan Dirham", labelAr: "درهم مغربي" },
  { value: "DZD", labelEn: "Algerian Dinar", labelAr: "دينار جزائري" },
  { value: "TND", labelEn: "Tunisian Dinar", labelAr: "دينار تونسي" },
  { value: "LYD", labelEn: "Libyan Dinar", labelAr: "دينار ليبي" },
  { value: "SDG", labelEn: "Sudanese Pound", labelAr: "جنيه سوداني" },
  { value: "USD", labelEn: "US Dollar", labelAr: "دولار أمريكي" },
  { value: "GBP", labelEn: "British Pound", labelAr: "جنيه إسترليني" },
  { value: "EUR", labelEn: "Euro", labelAr: "يورو" },
  { value: "TRY", labelEn: "Turkish Lira", labelAr: "ليرة تركية" },
];

export const COMPANY_TIMEZONES = [
  { value: "Africa/Cairo", labelEn: "Cairo (GMT+2)", labelAr: "القاهرة (GMT+2)" },
  { value: "Asia/Riyadh", labelEn: "Riyadh (GMT+3)", labelAr: "الرياض (GMT+3)" },
  { value: "Asia/Dubai", labelEn: "Dubai (GMT+4)", labelAr: "دبي (GMT+4)" },
  { value: "Asia/Kuwait", labelEn: "Kuwait (GMT+3)", labelAr: "الكويت (GMT+3)" },
  { value: "Asia/Qatar", labelEn: "Qatar (GMT+3)", labelAr: "قطر (GMT+3)" },
  { value: "Asia/Bahrain", labelEn: "Bahrain (GMT+3)", labelAr: "البحرين (GMT+3)" },
  { value: "Asia/Muscat", labelEn: "Muscat (GMT+4)", labelAr: "مسقط (GMT+4)" },
  { value: "Asia/Amman", labelEn: "Amman (GMT+3)", labelAr: "عمّان (GMT+3)" },
  { value: "Asia/Beirut", labelEn: "Beirut (GMT+2)", labelAr: "بيروت (GMT+2)" },
  { value: "Asia/Baghdad", labelEn: "Baghdad (GMT+3)", labelAr: "بغداد (GMT+3)" },
  { value: "Asia/Aden", labelEn: "Aden (GMT+3)", labelAr: "عدن (GMT+3)" },
  { value: "Asia/Hebron", labelEn: "Hebron (GMT+2)", labelAr: "الخليل (GMT+2)" },
  { value: "Asia/Gaza", labelEn: "Gaza (GMT+2)", labelAr: "غزة (GMT+2)" },
  { value: "Africa/Casablanca", labelEn: "Casablanca (GMT+1)", labelAr: "الدار البيضاء (GMT+1)" },
  { value: "Africa/Algiers", labelEn: "Algiers (GMT+1)", labelAr: "الجزائر (GMT+1)" },
  { value: "Africa/Tunis", labelEn: "Tunis (GMT+1)", labelAr: "تونس (GMT+1)" },
  { value: "Africa/Tripoli", labelEn: "Tripoli (GMT+2)", labelAr: "طرابلس (GMT+2)" },
  { value: "Africa/Khartoum", labelEn: "Khartoum (GMT+2)", labelAr: "الخرطوم (GMT+2)" },
  { value: "America/New_York", labelEn: "New York (GMT-5)", labelAr: "نيويورك (GMT-5)" },
  { value: "America/Chicago", labelEn: "Chicago (GMT-6)", labelAr: "شيكاغو (GMT-6)" },
  { value: "America/Denver", labelEn: "Denver (GMT-7)", labelAr: "دنفر (GMT-7)" },
  { value: "America/Los_Angeles", labelEn: "Los Angeles (GMT-8)", labelAr: "لوس أنجلوس (GMT-8)" },
  { value: "America/Anchorage", labelEn: "Anchorage (GMT-9)", labelAr: "أنكوراج (GMT-9)" },
  { value: "Pacific/Honolulu", labelEn: "Honolulu (GMT-10)", labelAr: "هونولولو (GMT-10)" },
  { value: "Europe/London", labelEn: "London (GMT+0)", labelAr: "لندن (GMT+0)" },
  { value: "Europe/Paris", labelEn: "Paris (GMT+1)", labelAr: "باريس (GMT+1)" },
  { value: "Europe/Berlin", labelEn: "Berlin (GMT+1)", labelAr: "برلين (GMT+1)" },
  { value: "Europe/Istanbul", labelEn: "Istanbul (GMT+3)", labelAr: "إسطنبول (GMT+3)" },
  { value: "UTC", labelEn: "UTC (GMT+0)", labelAr: "UTC (GMT+0)" },
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
    base_currency: "USD",
    timezone: "UTC",
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
    base_currency: enumValue(company.base_currency) || "USD",
    timezone: enumValue(company.timezone) || "UTC",
  };
}
