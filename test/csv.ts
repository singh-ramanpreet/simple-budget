/**
 * Builders for the flat CSV schema used by the app:
 *   date, name, amount, category, category_limit, notes
 *
 * `tx()` creates a spending transaction, `limit()` a budget bucket definition.
 * Avoid commas in values: the app quotes them on write but does not unquote on read.
 */
import type { CsvRecord } from "@/components/dashboard/types"

export const CSV_HEADER = "date,name,amount,category,category_limit,notes"

const COLUMNS = CSV_HEADER.split(",") as Array<keyof CsvRecord>

/** A spending transaction row (category_limit is always "0") */
export function tx(
  date: string,
  name: string,
  amount: number | string,
  category: string,
  notes: string = ""
): CsvRecord {
  return { date, name, amount: String(amount), category, category_limit: "0", notes }
}

/** A budget limit row for a category in the month of `date` (name is empty, amount is "0") */
export function limit(date: string, category: string, categoryLimit: number | string): CsvRecord {
  return { date, name: "", amount: "0", category, category_limit: String(categoryLimit), notes: "" }
}

/** Serialises records to the CSV text the app expects to find in the file */
export function toCsv(records: Array<CsvRecord>): string {
  return [CSV_HEADER, ...records.map((r) => COLUMNS.map((c) => r[c]).join(","))].join("\n")
}

/** Parses CSV text (as written by the app) back into typed records */
export function parseCsv(csv: string): Array<CsvRecord> {
  const lines = csv.split("\n").filter((l) => l.trim())
  const headers = lines[0].split(",").map((h) => h.trim()) as Array<keyof CsvRecord>
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim())
    const record = {} as CsvRecord
    headers.forEach((h, i) => (record[h] = values[i] || ""))
    return record
  })
}
