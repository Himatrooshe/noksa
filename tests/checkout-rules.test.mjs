import test from "node:test";
import assert from "node:assert/strict";
import {
  FREE_SHIPPING_MIN,
  SHIPPING_FLAT_RATE,
  normalizeUsPhone,
  shippingFor,
  validateCheckout,
} from "../src/lib/checkout-rules.mjs";

const valid = {
  email: "  Shopper@Example.com ",
  phone: "(415) 555-0132",
  name: "Ada  Lovelace",
  address1: "1 Market St",
  address2: "",
  city: "San Francisco",
  state: "ca",
  zip: "94105",
  items: [{ id: "62365601-5683-4bae-afcc-3854ce1640f1", quantity: 2 }],
};

test("charges the flat rate below the free-shipping threshold and nothing at or above it", () => {
  assert.equal(shippingFor(0), SHIPPING_FLAT_RATE);
  assert.equal(shippingFor(FREE_SHIPPING_MIN - 1), SHIPPING_FLAT_RATE);
  assert.equal(shippingFor(FREE_SHIPPING_MIN), 0);
  assert.equal(shippingFor(FREE_SHIPPING_MIN + 40), 0);
});

test("normalizes US phone numbers and rejects invalid ones", () => {
  assert.equal(normalizeUsPhone("(415) 555-0132"), "+14155550132");
  assert.equal(normalizeUsPhone("+1 415.555.0132"), "+14155550132");
  assert.equal(normalizeUsPhone("555-0132"), null);
  assert.equal(normalizeUsPhone("(015) 555-0132"), null);
  assert.equal(normalizeUsPhone("+44 20 7946 0958"), null);
});

test("accepts a complete order and cleans its fields", () => {
  const result = validateCheckout(valid);
  assert.equal(result.ok, true);
  assert.equal(result.value.email, "shopper@example.com");
  assert.equal(result.value.phone, "+14155550132");
  assert.equal(result.value.name, "Ada Lovelace");
  assert.equal(result.value.state, "CA");
  assert.deepEqual(result.value.items, valid.items);
});

test("reports every invalid field", () => {
  const result = validateCheckout({ ...valid, email: "nope", phone: "12", name: "", address1: "", city: "", state: "ZZ", zip: "1234" });
  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ["address1", "city", "email", "name", "phone", "state", "zip"]);
});

test("rejects empty, duplicated, malformed or oversized bags", () => {
  const id = valid.items[0].id;
  for (const items of [
    [],
    [{ id, quantity: 1 }, { id, quantity: 1 }],
    [{ id: "not-a-uuid", quantity: 1 }],
    [{ id, quantity: 0 }],
    [{ id, quantity: 1.5 }],
    [{ id, quantity: 21 }],
    "everything",
  ]) {
    const result = validateCheckout({ ...valid, items });
    assert.equal(result.ok, false, JSON.stringify(items));
    assert.ok(result.errors.items);
  }
});

test("never trusts prices or totals sent by the browser", () => {
  const result = validateCheckout({ ...valid, total: 1, items: [{ ...valid.items[0], price: 0 }] });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value.items, valid.items);
  assert.equal("total" in result.value, false);
});
