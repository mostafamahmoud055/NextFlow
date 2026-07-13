export function enumValue(field) {
  if (field == null) return null;
  if (typeof field === "object") return field.value ?? null;
  return field;
}
