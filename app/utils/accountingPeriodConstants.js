import { enumValue } from "~/utils/enumValue";

export const ACCOUNTING_PERIOD_STATUSES = [
  { value: "open", labelKey: "accountingPeriod.statusOpen" },
  { value: "closed", labelKey: "accountingPeriod.statusClosed" },
  { value: "archived", labelKey: "accountingPeriod.statusArchived" },
];

export function accountingPeriodDisplayName(period, locale = "en") {
  if (!period) return "";
  if (locale === "ar") {
    return (
      period.name_ar ||
      period.display_name ||
      period.name_en || ""
    );
  }
  return (
    period.name_en ||
    period.display_name ||
    period.name_ar ||
    ""
  );
}

export function emptyAccountingPeriodForm() {
  return {
    name_en: "",
    name_ar: "",
    fiscal_year_id: null,
    start_date: "",
    end_date: "",
    status: "closed",
    is_closing_period: false,
    notes: "",
  };
}

export function accountingPeriodToForm(period) {
  if (!period) return emptyAccountingPeriodForm();

  return {
    name_en: period.name_en || "",
    name_ar: period.name_ar || "",
    fiscal_year_id: period.fiscal_year_id || null,
    start_date: period.start_date || "",
    end_date: period.end_date || "",
    status: enumValue(period.status) || "closed",
    is_closing_period: Boolean(period.is_closing_period),
    notes: period.notes || "",
  };
}
