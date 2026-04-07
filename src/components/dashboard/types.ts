/**
 * Shared types and helpers for the client-only dashboard.
 *
 * CSV schema: date, name, amount, category, category_limit, notes
 *
 * Two types of records coexist in the same CSV:
 *
 * 1. Transaction records (spending entries):
 *    date, name, amount, category, 0, notes
 *    e.g. "2024-04-01, Groceries, 85.20, Food, 0, Weekly run"
 *
 * 2. Limit records (budget bucket definitions):
 *    YYYY-MM-01, "", 0, CATEGORY_NAME, CATEGORY_LIMIT, ""
 *    e.g. "2024-04-01, , 0, Food, 500.00, "
 *
 * Limit records are identified by: name === "" && category_limit > 0
 */

/** A single row from the flat CSV, typed for safe access */
export interface CsvRecord {
  date: string
  name: string
  amount: string
  category: string
  category_limit: string
  notes: string
}

/** A bucket is a unique (category, month, year) with its limit and spent sum */
export interface BucketView {
  category: string
  limit: number
  spent: number
  month: number
  year: number
}

/** Converts a raw Record<string, unknown> row into a typed CsvRecord */
export function toRecord(r: Record<string, unknown>): CsvRecord {
  return {
    date: String(r.date || ""),
    name: String(r.name || ""),
    amount: String(r.amount || "0"),
    category: String(r.category || ""),
    category_limit: String(r.category_limit || "0"),
    notes: String(r.notes || ""),
  }
}

/** Returns true if the record is a budget limit definition, not a transaction */
export function isLimitRecord(r: CsvRecord): boolean {
  return r.name === "" && parseFloat(r.category_limit) > 0
}

/**
 * Safely parses a YYYY-MM-DD string into local year, month, and day integers,
 * avoiding the UTC timezone shift issue of new Date("YYYY-MM-DD")
 */
export function parseLocalDate(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.split("-")
  if (parts.length >= 3) {
    return {
      year: parseInt(parts[0], 10),
      month: parseInt(parts[1], 10),
      day: parseInt(parts[2], 10),
    }
  }
  // Fallback for unexpected formats
  const d = new Date(dateStr)
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
}

/** Safe percentage helper (avoids division by zero) */
export function pct(value: number, total: number): number {
  if (total === 0) return 0
  return (value / total) * 100
}
