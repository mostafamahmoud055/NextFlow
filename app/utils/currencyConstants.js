export const ROUNDING_MODES = [
  { value: "half_up", labelKey: "currency.roundingHalfUp" },
  { value: "half_down", labelKey: "currency.roundingHalfDown" },
  { value: "half_even", labelKey: "currency.roundingHalfEven" },
  { value: "up", labelKey: "currency.roundingUp" },
  { value: "down", labelKey: "currency.roundingDown" },
];

export function emptyCurrencyForm() {
  return {
    currency_code: null,
    decimal_places: 2,
    allow_rounding: true,
    rounding_mode: "half_up",
    is_base: false,
  };
}

export function currencyToForm(row) {
  if (!row) return emptyCurrencyForm();

  return {
    currency_code: row.currency?.code || null,
    decimal_places: row.decimal_places ?? 2,
    allow_rounding: Boolean(row.allow_rounding),
    rounding_mode: row.rounding_mode || "half_up",
    is_base: Boolean(row.is_base),
  };
}
