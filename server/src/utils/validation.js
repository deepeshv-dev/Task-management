export function validEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}
