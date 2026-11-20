// Client-safe checkout rules shared by the checkout page, the checkout API and
// tests. Prices are whole US dollars, as everywhere else in the catalog.

export const SHIPPING_FLAT_RATE = 7;
export const FREE_SHIPPING_MIN = 75;
export const MAX_LINE_QUANTITY = 20;
export const MAX_LINES = 20;

/** @param {number} subtotal @returns {number} */
export function shippingFor(subtotal) {
  return subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FLAT_RATE;
}

export const US_STATES = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"],
  ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"],
  ["FL", "Florida"], ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"],
  ["IN", "Indiana"], ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"],
  ["ME", "Maine"], ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"],
  ["MS", "Mississippi"], ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"],
  ["NH", "New Hampshire"], ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"],
  ["NC", "North Carolina"], ["ND", "North Dakota"], ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"],
  ["PA", "Pennsylvania"], ["RI", "Rhode Island"], ["SC", "South Carolina"], ["SD", "South Dakota"],
  ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"], ["VT", "Vermont"], ["VA", "Virginia"],
  ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"], ["WY", "Wyoming"],
];
const STATE_CODES = new Set(US_STATES.map(([code]) => code));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * US phone numbers as +1XXXXXXXXXX, or null when not a valid 10-digit number.
 * @param {unknown} value
 * @returns {string | null}
 */
export function normalizeUsPhone(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(national)) return null;
  return `+1${national}`;
}

/**
 * @typedef {{ id: string, quantity: number }} CheckoutItem
 * @typedef {{ email: string, phone: string, name: string, address1: string, address2: string,
 *   city: string, state: string, zip: string, items: CheckoutItem[] }} CheckoutForm
 * @typedef {{ ok: true, value: CheckoutForm } | { ok: false, errors: Record<string, string> }} CheckoutValidation
 */

/** @param {unknown} value @param {number} max */
const text = (value, max) => String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);

/**
 * Validates a checkout submission. Returns `{ ok: true, value }` with cleaned
 * fields, or `{ ok: false, errors }` keyed by field name (and `items`).
 * @param {unknown} input
 * @returns {CheckoutValidation}
 */
export function validateCheckout(input) {
  /** @type {Record<string, string>} */
  const errors = {};
  /** @type {Record<string, any>} */
  const source = input && typeof input === "object" ? input : {};
  const value = {
    email: text(source.email, 254).toLowerCase(),
    phone: normalizeUsPhone(source.phone),
    name: text(source.name, 80),
    address1: text(source.address1, 120),
    address2: text(source.address2, 120),
    city: text(source.city, 60),
    state: text(source.state, 2).toUpperCase(),
    zip: text(source.zip, 10),
    /** @type {CheckoutItem[]} */
    items: [],
  };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.email)) errors.email = "Enter a valid email address.";
  if (!value.phone) errors.phone = "Enter a 10-digit US phone number.";
  if (value.name.length < 2) errors.name = "Enter the recipient’s full name.";
  if (!value.address1) errors.address1 = "Enter a street address.";
  if (!value.city) errors.city = "Enter a city.";
  if (!STATE_CODES.has(value.state)) errors.state = "Choose a state.";
  if (!/^\d{5}(-\d{4})?$/.test(value.zip)) errors.zip = "Enter a 5-digit ZIP code.";

  const items = Array.isArray(source.items) ? source.items : [];
  const seen = new Set();
  for (const item of items) {
    const id = item && typeof item.id === "string" ? item.id : "";
    const quantity = item ? item.quantity : 0;
    if (!UUID.test(id) || seen.has(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_LINE_QUANTITY) {
      errors.items = "Your bag has an item we couldn’t read. Refresh the page and try again.";
      break;
    }
    seen.add(id);
    value.items.push({ id, quantity });
  }
  if (!errors.items && (value.items.length === 0 || value.items.length > MAX_LINES)) {
    errors.items = value.items.length === 0 ? "Your bag is empty." : "Your bag has too many different items.";
  }
  if (Object.keys(errors).length || !value.phone) return { ok: false, errors };
  return { ok: true, value: { ...value, phone: value.phone } };
}
