import type { GradYear } from "../types";

export const GRAD_YEAR_VALUES = [2025, 2026, 2027, 2028, 2029, 2030] as const satisfies readonly GradYear[];

export function parseGradYear(value: unknown, fallback: GradYear = 2026): GradYear {
  const year = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  return (GRAD_YEAR_VALUES as readonly number[]).includes(year) ? (year as GradYear) : fallback;
}
