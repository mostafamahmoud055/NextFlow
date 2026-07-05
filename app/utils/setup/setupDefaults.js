export function createBranch(index = 0) {
  return {
    name_en: "",
    name_ar: "",
    type: index === 0 ? "main" : "branch",
  };
}

export function createTax(index = 0) {
  return {
    tax_code: index === 0 ? "VAT" : "",
    name_en: index === 0 ? "VAT" : "",
    name_ar: index === 0 ? "ضريبة القيمة المضافة" : "",
    type: "vat",
    method: "percentage",
    rate: 14,
    scope: "both",
    calculation_level: "line",
    effective_date: new Date().toISOString().slice(0, 10),
  };
}

export function createUser(prefill = {}) {
  return {
    name: prefill.name ?? "",
    email: prefill.email ?? "",
    password: "",
    roles: [],
  };
}

export function createRole() {
  return {
    name_en: "",
    name_ar: "",
    permissions: [],
  };
}

export function createWarehouse(index = 0) {
  return {
    name_en: "",
    name_ar: "",
    branch_id: null,
    type: index === 0 ? "main" : "sub",
  };
}

export function createPermissionAssignment(index = 0) {
  return {
    user_id: "",
    roles: [],
  };
}
