export function required(value, message = "This field is required") {
  if (value === null || value === undefined || String(value).trim() === "") {
    return message;
  }
  return "";
}

export function email(value, message = "Invalid email") {
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

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

export function validateForgotPasswordForm(form) {
  const errors = {};

  setError(errors, "email", required(form.email, "Email is required"));
  if (!errors.email) {
    setError(errors, "email", email(form.email, "Invalid email"));
  }

  return errors;
}

export function validateResetPasswordForm(form) {
  const errors = {};

  setError(errors, "email", required(form.email, "Email is required"));
  if (!errors.email) {
    setError(errors, "email", email(form.email, "Invalid email"));
  }

  setError(errors, "otp", required(form.otp, "OTP is required"));
  if (!errors.otp) {
    setError(errors, "otp", minLength(form.otp, 6, "OTP must be 6 digits"));
  }

  setError(errors, "password", required(form.password, "Password is required"));
  if (!errors.password) {
    setError(errors, "password", minLength(form.password, 8, "Password must be at least 8 characters"));
  }

  setError(errors, "password_confirmation", required(form.password_confirmation, "Password confirmation is required"));
  if (!errors.password_confirmation) {
    setError(errors, "password_confirmation", matches(form.password_confirmation, form.password, "Passwords do not match"));
  }

  return errors;
}

export function validateVerifyOtpForm(form) {
  const errors = {};

  setError(errors, "otp", required(form.otp, "OTP is required"));
  if (!errors.otp) {
    setError(errors, "otp", minLength(form.otp, 6, "OTP must be 6 digits"));
  }

  return errors;
}
