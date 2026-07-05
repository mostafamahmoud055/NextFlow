export function itemError(errors, index, field) {
  const message = errors?.[`${index}.${field}`];

  return message ? [message] : [];
}

export function listError(errors, field) {
  const message = errors?.[field];

  return message ? [message] : [];
}
