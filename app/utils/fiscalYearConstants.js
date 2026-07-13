import { enumValue } from "~/utils/enumValue";

export const FISCAL_YEAR_STATUSES = [
  { value: "open", labelKey: "fiscalYear.statusOpen" },
  { value: "closed", labelKey: "fiscalYear.statusClosed" },
  { value: "archived", labelKey: "fiscalYear.statusArchived" },
];

export function emptyFiscalYearForm() {
  return {
    start_date: "",
    end_date: "",
    status: "open",
    is_default: false,
    notes: "",
  };
}

export function fiscalYearToForm(fiscalYear) {
  if (!fiscalYear) return emptyFiscalYearForm();

  return {
    start_date: fiscalYear.start_date || "",
    end_date: fiscalYear.end_date || "",
    status: enumValue(fiscalYear.status) || "open",
    is_default: Boolean(fiscalYear.is_default),
    notes: fiscalYear.notes || "",
  };
}
