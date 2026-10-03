/** Every price on the site is in US dollars. The label is system-managed — the
 * admin only types the number, so nobody can mistype or double up "USD". */
export const CURRENCY_LABEL = "$USD";

/** Strips any currency the admin typed by hand ("$", "US$", "USD"); keeps free text like "Consultar". */
export function cleanPrice(raw: string): string {
  return raw.replace(/us\$|usd|\$/gi, "").replace(/\s+/g, " ").trim();
}

/** Splits a stored price into the cleaned amount + the system currency (numeric prices only). */
export function tourMoney(raw: string): { price: string; currencySymbol: string } {
  const price = cleanPrice(raw) || "Consultar";
  return { price, currencySymbol: /^\d/.test(price) ? CURRENCY_LABEL : "" };
}

/** "$USD 20" for numeric prices, "Consultar" otherwise. */
export function formatPrice(raw: string): string {
  const { price, currencySymbol } = tourMoney(raw);
  return [currencySymbol, price].filter(Boolean).join(" ");
}
