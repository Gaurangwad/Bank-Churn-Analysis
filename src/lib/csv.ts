import type { Customer } from "./types";

export interface ParseResult {
  customers: Customer[];
  warnings: string[];
}

/** Minimal RFC-4180-ish CSV parser (handles quoted fields and commas). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch === "\r") {
      // ignore — handled by \n
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0].trim() !== ""));
}

const COLUMN_ALIASES: Record<keyof Customer, string[]> = {
  customerId: ["customerid", "customer_id", "id", "rownumber"],
  surname: ["surname", "lastname", "name"],
  creditScore: ["creditscore", "credit_score", "credit"],
  geography: ["geography", "country", "region"],
  gender: ["gender", "sex"],
  age: ["age"],
  tenure: ["tenure"],
  balance: ["balance"],
  numOfProducts: ["numofproducts", "num_of_products", "products", "numproducts"],
  hasCrCard: ["hascrcard", "has_cr_card", "hascreditcard", "creditcard"],
  isActiveMember: ["isactivemember", "is_active_member", "active", "activemember"],
  estimatedSalary: ["estimatedsalary", "estimated_salary", "salary"],
  exited: ["exited", "churn", "churned", "attrition", "left"],
};

function normalize(h: string): string {
  return h.trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function toNumber(v: string | undefined, fallback = 0): number {
  if (v === undefined) return fallback;
  const n = Number(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

function toBinary(v: string | undefined): number {
  if (v === undefined) return 0;
  const s = String(v).trim().toLowerCase();
  if (["1", "yes", "true", "y", "active"].includes(s)) return 1;
  if (["0", "no", "false", "n", "inactive"].includes(s)) return 0;
  return toNumber(v) >= 1 ? 1 : 0;
}

/**
 * Parses an uploaded CSV into Customer records. Column matching is
 * case/spacing-insensitive and supports common aliases, so the standard
 * Kaggle "Churn_Modelling.csv" and most variants import cleanly.
 */
export function parseCustomerCsv(text: string): ParseResult {
  const rows = parseCsv(text);
  const warnings: string[] = [];
  if (rows.length < 2) {
    return { customers: [], warnings: ["The file does not contain any data rows."] };
  }

  const header = rows[0].map(normalize);
  const indexFor = (field: keyof Customer): number => {
    for (const alias of COLUMN_ALIASES[field]) {
      const idx = header.indexOf(alias);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const idx = Object.fromEntries(
    (Object.keys(COLUMN_ALIASES) as (keyof Customer)[]).map((k) => [k, indexFor(k)]),
  ) as Record<keyof Customer, number>;

  const required: (keyof Customer)[] = ["age", "numOfProducts", "isActiveMember", "geography"];
  const missing = required.filter((k) => idx[k] === -1);
  if (missing.length) {
    warnings.push(
      `Missing recommended column(s): ${missing.join(", ")}. Predictions may be less accurate.`,
    );
  }
  if (idx.exited === -1) {
    warnings.push(
      "No 'Exited'/'Churn' label column found — model accuracy cannot be measured, only predictions are shown.",
    );
  }

  const customers: Customer[] = [];
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    if (cells.every((c) => c.trim() === "")) continue;
    const get = (field: keyof Customer) => (idx[field] === -1 ? undefined : cells[idx[field]]);

    customers.push({
      customerId: get("customerId")?.trim() || String(r),
      surname: get("surname")?.trim() || "—",
      creditScore: toNumber(get("creditScore"), 650),
      geography: get("geography")?.trim() || "Unknown",
      gender: get("gender")?.trim() || "Unknown",
      age: toNumber(get("age"), 40),
      tenure: toNumber(get("tenure"), 5),
      balance: toNumber(get("balance"), 0),
      numOfProducts: toNumber(get("numOfProducts"), 1),
      hasCrCard: toBinary(get("hasCrCard")),
      isActiveMember: toBinary(get("isActiveMember")),
      estimatedSalary: toNumber(get("estimatedSalary"), 100000),
      exited: idx.exited === -1 ? 0 : toBinary(get("exited")),
    });
  }

  if (customers.length === 0) warnings.push("No valid rows could be parsed from the file.");
  return { customers, warnings };
}

export const hasLabelColumn = (text: string): boolean => {
  const rows = parseCsv(text);
  if (rows.length < 1) return false;
  const header = rows[0].map(normalize);
  return COLUMN_ALIASES.exited.some((a) => header.includes(a));
};
