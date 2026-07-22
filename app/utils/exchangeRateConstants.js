export const EXCHANGE_RATE_STATUSES = [
  { value: "active", labelKey: "exchangeRate.statusActive" },
  { value: "inactive", labelKey: "exchangeRate.statusInactive" },
];

export const EXCHANGE_RATE_TYPES = [
  { value: "buy", labelKey: "exchangeRate.typeBuy" },
  { value: "sell", labelKey: "exchangeRate.typeSell" },
  { value: "average", labelKey: "exchangeRate.typeAverage" },
  { value: "official", labelKey: "exchangeRate.typeOfficial" },
];

export function emptyExchangeRateForm() {
  return {
    currency_id: null,
    rate: "",
    rate_type: "average",
    effective_date: "",
    expiry_date: "",
    status: "active",
    notes: "",
    confirm_impact: false,
  };
}

export function exchangeRateToForm(rate) {
  if (!rate) return emptyExchangeRateForm();

  return {
    currency_id: rate.currency_id ?? null,
    rate: rate.rate != null ? String(rate.rate) : "",
    rate_type: rate.rate_type?.value || rate.rate_type || "average",
    effective_date: rate.effective_date || "",
    expiry_date: rate.expiry_date || "",
    status: rate.status?.value || rate.status || "active",
    notes: rate.notes || "",
    clear_expiry: false,
    confirm_impact: false,
  };
}

export function currencyLabel(currency, locale = "en") {
  if (!currency) return "";
  const name =
    locale === "ar"
      ? currency.name_ar || currency.name_en
      : currency.name_en || currency.name_ar;
  const code = currency.code || "";
  return name ? `${code} — ${name}` : code;
}
