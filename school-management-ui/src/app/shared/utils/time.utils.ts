/**
 * Converts 24-hour time string (HH:mm or HH:mm:ss) to 12-hour format.
 * @param t - Time string e.g. "18:25" or "19:41:00"
 * @param emptyValue - Value to return when t is empty
 * @returns e.g. "6:25 PM" or emptyValue
 */
export function formatTime12h(t?: string | null, emptyValue = '—'): string {
  if (!t) return emptyValue;
  const s = String(t).trim();
  if (!s) return emptyValue;
  const parts = s.split(':');
  const h = parseInt(parts[0] || '0', 10);
  const m = parseInt(parts[1] || '0', 10);
  if (isNaN(h) || isNaN(m)) return s;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const mStr = String(m).padStart(2, '0');
  return `${h12}:${mStr} ${ampm}`;
}
