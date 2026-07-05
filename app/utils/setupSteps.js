/** Mirrors backend SetupStep::ordered() — backend is source of truth. */
export const SETUP_STEPS = [
  "company",
  "branches",
  "fiscal_year",
  "currency",
  "taxes",
  "users",
  "permissions",
  "user_access_overview",
  "warehouses",
  "finish",
];

export const SETUP_STEP_ENDPOINTS = {
  company: "/setup/company",
  branches: "/setup/branches",
  fiscal_year: "/setup/fiscal-year",
  currency: "/setup/currency",
  taxes: "/setup/taxes",
  users: "/setup/users",
  permissions: "/setup/permissions",
  warehouses: "/setup/warehouses",
};

/** HTTP method per step — company is update-only after onboarding. */
export const SETUP_STEP_METHODS = {
  company: "PUT",
};

export function stepIndex(step) {
  return SETUP_STEPS.indexOf(step);
}

export function previousStep(step) {
  const index = stepIndex(step);

  return index > 0 ? SETUP_STEPS[index - 1] : null;
}

export function nextStep(step) {
  const index = stepIndex(step);

  return index >= 0 && index < SETUP_STEPS.length - 1 ? SETUP_STEPS[index + 1] : null;
}

export function isStoredStep(step) {
  return step !== "user_access_overview" && step !== "finish";
}
