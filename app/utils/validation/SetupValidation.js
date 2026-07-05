import {
  hasErrors,
  isEmail,
  isRequired,
  minLength,
} from "@/utils/validation/AuthValidation";
import {
  SETUP_CURRENCY_CODES,
  SETUP_TIMEZONE_VALUES,
} from "@/data/geo/currencies";

export { hasErrors };

export const SETUP_CURRENCIES = SETUP_CURRENCY_CODES;
export const SETUP_TIMEZONES = SETUP_TIMEZONE_VALUES;
export const SETUP_BRANCH_TYPES = ["main", "branch"];
export const SETUP_WAREHOUSE_TYPES = ["main", "sub"];

function setError(errors, field, message) {
  if (message) errors[field] = message;
}

function msg(t, key, fallback) {
  return typeof t === "function" ? t(key) : fallback;
}

function isInList(value, list, message) {
  if (!value) return "";
  return list.includes(String(value).trim()) ? "" : message;
}

function isPositiveInteger(value, message) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) return message;
  return "";
}

function isNumberInRange(value, min, max, message) {
  if (value === null || value === undefined || value === "") return "";
  const number = Number(value);
  if (Number.isNaN(number) || number < min || number > max) return message;
  return "";
}

function isValidDate(value, message) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? message : "";
}

function isDateOnOrAfter(value, minValue, message) {
  if (!value || !minValue) return "";
  const date = new Date(value);
  const minDate = new Date(minValue);
  if (Number.isNaN(date.getTime()) || Number.isNaN(minDate.getTime())) return "";
  return date >= minDate ? "" : message;
}

export function validateInstallForm(form, t) {
  const errors = {};

  setError(
    errors,
    "name_en",
    isRequired(form.name_en, msg(t, "validation.setup.nameEn.required", "Name (English) is required")),
  );
  setError(
    errors,
    "name_ar",
    isRequired(form.name_ar, msg(t, "validation.setup.nameAr.required", "Name (Arabic) is required")),
  );

  return errors;
}

export function validateCompanyForm(form, t) {
  const errors = {};

  setError(
    errors,
    "name_en",
    isRequired(form.name_en, msg(t, "validation.setup.nameEn.required", "Name (English) is required")),
  );
  setError(
    errors,
    "name_ar",
    isRequired(form.name_ar, msg(t, "validation.setup.nameAr.required", "Name (Arabic) is required")),
  );

  if (form.email) {
    setError(
      errors,
      "email",
      isEmail(form.email, msg(t, "validation.setup.email.invalid", "Email must be valid")),
    );
  }

  return errors;
}

function mergeIndexedErrors(errors, index, itemErrors) {
  for (const [field, message] of Object.entries(itemErrors)) {
    if (message) {
      errors[`${index}.${field}`] = message;
    }
  }
}

function validateBranchItem(branch, t) {
  const errors = {};

  setError(
    errors,
    "name_en",
    isRequired(branch.name_en, msg(t, "validation.setup.nameEn.required", "Name (English) is required")),
  );
  setError(
    errors,
    "name_ar",
    isRequired(branch.name_ar, msg(t, "validation.setup.nameAr.required", "Name (Arabic) is required")),
  );
  setError(
    errors,
    "type",
    isRequired(branch.type, msg(t, "validation.setup.branchType.required", "Branch type is required")),
  );
  if (!errors.type) {
    setError(
      errors,
      "type",
      isInList(branch.type, SETUP_BRANCH_TYPES, msg(t, "validation.setup.branchType.invalid", "Invalid branch type")),
    );
  }

  return errors;
}

export function validateBranchesForm(branches, t) {
  const errors = {};

  if (!Array.isArray(branches) || branches.length === 0) {
    errors.branches = msg(t, "validation.setup.minOneItem", "At least one entry is required");
    return errors;
  }

  branches.forEach((branch, index) => {
    mergeIndexedErrors(errors, index, validateBranchItem(branch, t));
  });

  return errors;
}

export function validateFiscalYearForm(form, t) {
  const errors = {};


  setError(
    errors,
    "name",
    isRequired(form.name, msg(t, "validation.setup.fiscalYearName.required", "Fiscal year name is required")),
  );
  setError(
    errors,
    "start_date",
    isRequired(form.start_date, msg(t, "validation.setup.startDate.required", "Start date is required")),
  );
  if (!errors.start_date) {
    setError(
      errors,
      "start_date",
      isValidDate(form.start_date, msg(t, "validation.setup.startDate.invalid", "Start date must be valid")),
    );
  }

  setError(
    errors,
    "end_date",
    isRequired(form.end_date, msg(t, "validation.setup.endDate.required", "End date is required")),
  );
  if (!errors.end_date) {
    setError(
      errors,
      "end_date",
      isValidDate(form.end_date, msg(t, "validation.setup.endDate.invalid", "End date must be valid")),
    );
  }
  if (!errors.start_date && !errors.end_date) {
    setError(
      errors,
      "end_date",
      isDateOnOrAfter(
        form.end_date,
        form.start_date,
        msg(t, "validation.setup.endDate.afterStart", "End date must be on or after start date"),
      ),
    );
  }

  return errors;
}

export function validateCurrencyForm(form, t) {
  const errors = {};

  setError(
    errors,
    "base_currency",
    isRequired(form.base_currency, msg(t, "validation.setup.currency.required", "Base currency is required")),
  );
  if (!errors.base_currency) {
    setError(
      errors,
      "base_currency",
      isInList(form.base_currency, SETUP_CURRENCIES, msg(t, "validation.setup.currency.invalid", "Invalid currency")),
    );
  }

  setError(
    errors,
    "timezone",
    isRequired(form.timezone, msg(t, "validation.setup.timezone.required", "Timezone is required")),
  );
  if (!errors.timezone) {
    setError(
      errors,
      "timezone",
      isInList(form.timezone, SETUP_TIMEZONES, msg(t, "validation.setup.timezone.invalid", "Invalid timezone")),
    );
  }

  return errors;
}

function validateTaxItem(tax, t) {
  const errors = {};

  setError(
    errors,
    "name_en",
    isRequired(tax.name_en, msg(t, "validation.setup.nameEn.required", "Name (English) is required")),
  );
  setError(
    errors,
    "name_ar",
    isRequired(tax.name_ar, msg(t, "validation.setup.nameAr.required", "Name (Arabic) is required")),
  );
  setError(
    errors,
    "rate",
    isRequired(tax.rate, msg(t, "validation.setup.taxRate.required", "Tax rate is required")),
  );
  if (!errors.rate) {
    setError(
      errors,
      "rate",
      isNumberInRange(tax.rate, 0, 100, msg(t, "validation.setup.taxRate.range", "Tax rate must be between 0 and 100")),
    );
  }
  setError(
    errors,
    "effective_date",
    isRequired(tax.effective_date, msg(t, "validation.setup.effectiveDate.required", "Effective date is required")),
  );
  if (!errors.effective_date) {
    setError(
      errors,
      "effective_date",
      isValidDate(tax.effective_date, msg(t, "validation.setup.effectiveDate.invalid", "Effective date must be valid")),
    );
  }

  return errors;
}

export function validateTaxesForm(taxes, t) {
  const errors = {};

  if (!Array.isArray(taxes) || taxes.length === 0) {
    errors.taxes = msg(t, "validation.setup.minOneItem", "At least one entry is required");
    return errors;
  }

  const codes = new Set();

  taxes.forEach((tax, index) => {
    mergeIndexedErrors(errors, index, validateTaxItem(tax, t));

    const code = String(tax.tax_code ?? "").trim().toUpperCase();
    if (code) {
      if (codes.has(code)) {
        errors[`${index}.tax_code`] = msg(t, "validation.setup.duplicateCode", "This code is already used in this form");
      } else {
        codes.add(code);
      }
    }
  });

  return errors;
}

function validateUserItem(user, t) {
  const errors = {};

  setError(
    errors,
    "name",
    isRequired(user.name, msg(t, "validation.name.required", "Name is required")),
  );
  if (!errors.name) {
    setError(
      errors,
      "name",
      minLength(user.name, 2, msg(t, "validation.name.minLength", "Name must be at least 2 characters")),
    );
  }

  setError(
    errors,
    "email",
    isRequired(user.email, msg(t, "validation.email.required", "Email is required")),
  );
  if (!errors.email) {
    setError(
      errors,
      "email",
      isEmail(user.email, msg(t, "validation.email.invalid", "Email must be valid")),
    );
  }

  setError(
    errors,
    "password",
    isRequired(user.password, msg(t, "validation.password.required", "Password is required")),
  );
  if (!errors.password) {
    setError(
      errors,
      "password",
      minLength(user.password, 8, msg(t, "validation.password.minLength", "Password must be at least 8 characters")),
    );
  }

  const roleIds = Array.isArray(user.roles)
    ? user.roles.map((value) => Number(value)).filter((value) => Number.isInteger(value) && value > 0)
    : [];

  if (!roleIds.length) {
    setError(
      errors,
      "roles",
      msg(t, "validation.setup.roles.required", "At least one role is required"),
    );
  }

  return errors;
}

export function validateUsersForm(users, t) {
  const errors = {};

  if (!Array.isArray(users) || users.length === 0) {
    errors.users = msg(t, "validation.setup.minOneItem", "At least one entry is required");
    return errors;
  }

  const emails = new Set();

  users.forEach((user, index) => {
    mergeIndexedErrors(errors, index, validateUserItem(user, t));

    const email = String(user.email ?? "").trim().toLowerCase();
    if (email) {
      if (emails.has(email)) {
        errors[`${index}.email`] = msg(t, "validation.setup.duplicateEmail", "This email is already used in this form");
      } else {
        emails.add(email);
      }
    }
  });

  return errors;
}

export function validatePermissionsForm(roles, t) {
  const errors = {};

  if (!Array.isArray(roles) || !roles.length) {
    setError(
      errors,
      "roles",
      msg(t, "validation.setup.permissions.required", "At least one role is required"),
    );
    return errors;
  }

  roles.forEach((role, index) => {
    setError(
      errors,
      `${index}.name_en`,
      isRequired(role?.name_en, msg(t, "validation.setup.nameEn.required", "Name (English) is required")),
    );
    setError(
      errors,
      `${index}.name_ar`,
      isRequired(role?.name_ar, msg(t, "validation.setup.nameAr.required", "Name (Arabic) is required")),
    );

    const permissions = Array.isArray(role?.permissions) ? role.permissions.filter(Boolean) : [];
    if (!permissions.length) {
      setError(
        errors,
        `${index}.permissions`,
        msg(t, "validation.setup.permissions.required", "Select at least one permission"),
      );
    }
  });

  return errors;
}

function validateWarehouseItem(warehouse, t) {
  const errors = {};

  setError(
    errors,
    "name_en",
    isRequired(warehouse.name_en, msg(t, "validation.setup.nameEn.required", "Name (English) is required")),
  );
  setError(
    errors,
    "name_ar",
    isRequired(warehouse.name_ar, msg(t, "validation.setup.nameAr.required", "Name (Arabic) is required")),
  );
  setError(
    errors,
    "branch_id",
    isRequired(warehouse.branch_id, msg(t, "validation.setup.branchId.required", "Branch ID is required")),
  );
  if (!errors.branch_id) {
    setError(
      errors,
      "branch_id",
      isPositiveInteger(warehouse.branch_id, msg(t, "validation.setup.branchId.invalid", "Branch ID must be a positive number")),
    );
  }
  setError(
    errors,
    "type",
    isRequired(warehouse.type, msg(t, "validation.setup.warehouseType.required", "Warehouse type is required")),
  );
  if (!errors.type) {
    setError(
      errors,
      "type",
      isInList(warehouse.type, SETUP_WAREHOUSE_TYPES, msg(t, "validation.setup.warehouseType.invalid", "Invalid warehouse type")),
    );
  }

  return errors;
}

export function validateWarehousesForm(warehouses, t) {
  const errors = {};

  if (!Array.isArray(warehouses) || warehouses.length === 0) {
    errors.warehouses = msg(t, "validation.setup.minOneItem", "At least one entry is required");
    return errors;
  }

  warehouses.forEach((warehouse, index) => {
    mergeIndexedErrors(errors, index, validateWarehouseItem(warehouse, t));
  });

  return errors;
}

export function validateSetupStep(step, data, t) {
  switch (step) {
    case "company":
      return validateCompanyForm(data, t);
    case "branches":
      return validateBranchesForm(data.branches, t);
    case "fiscal_year":
      return validateFiscalYearForm(data, t);
    case "currency":
      return validateCurrencyForm(data, t);
    case "taxes":
      return validateTaxesForm(data.taxes, t);
    case "users":
      return validateUsersForm(data.users, t);
    case "permissions":
      return validatePermissionsForm(data.assignments, t);
    case "warehouses":
      return validateWarehousesForm(data.warehouses, t);
    default:
      return {};
  }
}
