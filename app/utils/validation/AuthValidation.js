export function isRequired(value, message = "This field is required") {
  if (value === null || value === undefined || String(value).trim() === "") {
    return message;
  }
  return "";
}

export function isEmail(value, message = "Invalid email") {
  if (!value) return "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim()) ? "" : message;
}

export function minLength(value, length, message = `Minimum ${length} characters`) {
  if (!value) return "";
  return String(value).length >= length ? "" : message;
}

export function matches(value, other, message = "Values do not match") {
  return value === other ? "" : message;
}

function setError(errors, field, message) {
  if (message) errors[field] = message;
}

export function validateLoginForm(form) {
  const errors = {};

  setError(errors, "email", isRequired(form.email, "Email is required"));
  if (!errors.email) {
    setError(errors, "email", isEmail(form.email, "Invalid email"));
  }

  setError(errors, "password", isRequired(form.password, "Password is required"));
  if (!errors.password) {
    setError(errors, "password", minLength(form.password, 8, "Password must be at least 8 characters"));
  }

  return errors;
}

export function validateRegisterForm(form) {
  const errors = {};

  setError(errors, "name", isRequired(form.name, "Name is required"));

  setError(errors, "email", isRequired(form.email, "Email is required"));
  if (!errors.email) {
    setError(errors, "email", isEmail(form.email, "Invalid email"));
  }

  setError(errors, "password", isRequired(form.password, "Password is required"));
  if (!errors.password) {
    setError(errors, "password", minLength(form.password, 8, "Password must be at least 8 characters"));
  }

  setError(errors, "password_confirmation", isRequired(form.password_confirmation, "Password confirmation is required"));
  if (!errors.password_confirmation) {
    setError(errors, "password_confirmation", matches(form.password_confirmation, form.password, "Passwords do not match"));
  }

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
