// Inventory tracker with reactive subscriptions.
// Demonstrates classes, private fields, generators, destructuring, and regex.

import { setTimeout as wait } from "node:timers/promises";

const SKU_PATTERN = /^[A-Z]{2}-\d{4}-[a-z0-9]{3}$/;

const TAX_RATES = Object.freeze({
  US: 0.0725,
  UK: 0.2,
  DE: 0.19,
});

/**
 * @typedef {Object} Item
 * @property {string} sku
 * @property {number} price
 * @property {number} stock
 */

export class Inventory {
  #items = new Map();
  #subscribers = new Set();

  constructor(seed = []) {
    for (const item of seed) this.add(item);
  }

  add({ sku, price, stock = 0 }) {
    if (!SKU_PATTERN.test(sku)) {
      throw new TypeError(`Invalid SKU: "${sku}"`);
    }
    this.#items.set(sku, { sku, price, stock });
    this.#notify({ type: "add", sku });
    return this;
  }

  adjust(sku, delta) {
    const item = this.#items.get(sku);
    if (!item) return null;
    item.stock = Math.max(0, item.stock + delta);
    this.#notify({ type: "adjust", sku, delta });
    return item.stock;
  }

  *outOfStock() {
    for (const [sku, item] of this.#items) {
      if (item.stock === 0) yield sku;
    }
  }

  total(region = "US") {
    const rate = TAX_RATES[region] ?? 0;
    let sum = 0;
    for (const { price, stock } of this.#items.values()) {
      sum += price * stock * (1 + rate);
    }
    return Number(sum.toFixed(2));
  }

  subscribe(fn) {
    this.#subscribers.add(fn);
    return () => this.#subscribers.delete(fn);
  }

  #notify(event) {
    for (const fn of this.#subscribers) fn(event);
  }
}

const store = new Inventory([
  { sku: "BK-0001-abc", price: 14.99, stock: 12 },
  { sku: "MG-0042-xyz", price: 8.5, stock: 0 },
]);

const unsubscribe = store.subscribe(({ type, sku }) =>
  console.log(`[${type}] ${sku}`),
);

await wait(50);
store.adjust("BK-0001-abc", -3);
console.log(`Total (UK): £${store.total("UK")}`);
console.log("Out:", [...store.outOfStock()]);
unsubscribe();
