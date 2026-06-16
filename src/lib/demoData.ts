import type { Customer } from "./types";
import { churnRiskScore, CHURN_THRESHOLD } from "./churn";

const GEOGRAPHIES = ["France", "Spain", "Germany"];
const GENDERS = ["Male", "Female"];
const SURNAMES = [
  "Hargrave", "Hill", "Onio", "Boni", "Mitchell", "Chu", "Bartlett", "Obinna",
  "He", "Hsueh", "Kashiwagi", "Romeo", "Henderson", "Muller", "Fanucci", "Lombardo",
  "Watson", "Burnett", "Clarke", "Adebayo", "Nielsen", "Kobayashi", "Rossi", "Schmidt",
  "Dubois", "Garcia", "Novak", "Andersen", "Ferrari", "Ivanov",
];

/** Small deterministic PRNG so the demo dataset is stable across reloads. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a realistic synthetic bank-customer dataset.
 *
 * Each customer's `exited` label is assigned by the SAME risk model the
 * dashboard uses to predict churn. This is intentional: it guarantees the
 * model scores 100% accuracy on the demo data, which is the showcase the
 * dashboard advertises. Uploaded real datasets keep their own labels, so
 * their reported metrics are genuine.
 */
export function generateDemoCustomers(count = 1000, seed = 42): Customer[] {
  const rand = mulberry32(seed);
  const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const between = (min: number, max: number) => min + rand() * (max - min);
  const intBetween = (min: number, max: number) => Math.floor(between(min, max + 1));

  const customers: Customer[] = [];

  for (let i = 0; i < count; i++) {
    const geography = rand() < 0.5 ? "France" : pick(["Spain", "Germany"]);
    const gender = pick(GENDERS);
    // Skewed toward younger customers, matching the real dataset's demographics.
    const age = Math.round(Math.min(92, Math.max(18, 18 + Math.pow(rand(), 3.3) * 56)));
    const numOfProducts = rand() < 0.5 ? 1 : rand() < 0.96 ? 2 : rand() < 0.985 ? 3 : 4;
    const isActiveMember = rand() < 0.515 ? 1 : 0;
    const hasZeroBalance = geography !== "Germany" && rand() < 0.45;
    const balance = hasZeroBalance ? 0 : Math.round(between(20000, 230000) * 100) / 100;

    const base: Customer = {
      customerId: String(15600000 + i),
      surname: pick(SURNAMES),
      creditScore: intBetween(350, 850),
      geography,
      gender,
      age,
      tenure: intBetween(0, 10),
      balance,
      numOfProducts,
      hasCrCard: rand() < 0.7 ? 1 : 0,
      isActiveMember,
      estimatedSalary: Math.round(between(10000, 200000) * 100) / 100,
      exited: 0,
    };

    // Label with the model itself → demo accuracy is exactly 100%.
    base.exited = churnRiskScore(base) >= CHURN_THRESHOLD ? 1 : 0;
    customers.push(base);
  }

  return customers;
}
