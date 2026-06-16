export const pct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`;

export const compactCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);

export const currency = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);

export const number = (v: number) => new Intl.NumberFormat("en-US").format(Math.round(v));

export const decimal = (v: number, digits = 1) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(v);
