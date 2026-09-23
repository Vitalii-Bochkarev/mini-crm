function toMessageList(value) {
  return (Array.isArray(value) ? value : [value])
    .filter((message) => typeof message === "string" && message.trim())
    .map((message) => message.trim());
}

function getFieldName(backendKey, allowedFields) {
  const segments = String(backendKey)
    .trim()
    .split(/[.[\]]+/)
    .filter((segment) => segment && segment !== "$");
  const candidate = segments.at(-1)?.toLowerCase();

  return allowedFields.find((field) => field.toLowerCase() === candidate) || null;
}

export function getFormErrorState(error, allowedFields) {
  if (error?.status !== 400 || !error.fieldErrors) {
    return {
      fieldErrors: {},
      formError: error?.message || "Не удалось выполнить запрос",
    };
  }

  const fieldErrors = {};
  const unmatchedMessages = [];

  Object.entries(error.fieldErrors).forEach(([backendKey, value]) => {
    const messages = toMessageList(value);
    if (messages.length === 0) return;

    const field = getFieldName(backendKey, allowedFields);
    if (field) {
      fieldErrors[field] = [...(fieldErrors[field] || []), ...messages];
    } else {
      unmatchedMessages.push(...messages);
    }
  });

  return {
    fieldErrors,
    formError: unmatchedMessages.length > 0
      ? unmatchedMessages.join(" ")
      : Object.keys(fieldErrors).length === 0
        ? error.message || "Не удалось выполнить запрос"
        : "",
  };
}

export function clearFieldError(fieldErrors, field) {
  if (!fieldErrors[field]) return fieldErrors;

  const nextErrors = { ...fieldErrors };
  delete nextErrors[field];
  return nextErrors;
}
