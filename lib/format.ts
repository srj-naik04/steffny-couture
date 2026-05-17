/**
 * Display formatting for currency and phone numbers.
 * See the steffny-brand skill for the canonical rules.
 */

/**
 * "£42.00". A zero amount renders as "Free" (capitalised), never "£0.00".
 * Pass `null`/`undefined` for amounts not yet known (e.g. an unquoted job).
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '—';
  if (amount === 0) return 'Free';
  return `£${amount.toFixed(2)}`;
}

/** "£15 – £30" — an alteration price band (en-dash, spaces). */
export function formatPriceRange(min: number, max: number): string {
  if (min === max) return `£${min}`;
  return `£${min} – £${max}`;
}

/**
 * Format a UK number for display: "+44 7834 877992".
 * Accepts digits with or without a leading "+", "0", or "44".
 */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  let national = digits;
  if (national.startsWith('44')) national = national.slice(2);
  if (national.startsWith('0')) national = national.slice(1);
  if (national.length !== 10) return raw.trim(); // not a standard UK mobile — leave as-is
  return `+44 ${national.slice(0, 4)} ${national.slice(4)}`;
}

/** Bare digits with country code for `tel:` / `wa.me` links: "447834877992". */
export function toDialableDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('44')) return digits;
  if (digits.startsWith('0')) return `44${digits.slice(1)}`;
  return digits;
}
