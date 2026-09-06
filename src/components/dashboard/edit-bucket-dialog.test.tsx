import { describe, expect, test } from "bun:test"
import { screen, within } from "@testing-library/react"
import { limit, parseCsv, tx } from "@test/csv"
import { renderWithFile, waitForDialogToClose } from "@test/render"
import EditBucketDialog from "./edit-bucket-dialog"
import type { BucketView, CsvRecord } from "./types"

const FOOD_MARCH: BucketView = { category: "Food", limit: 500, spent: 16, month: 3, year: 2026 }

const RECORDS: Array<CsvRecord> = [
  limit("2026-03-01", "Food", 500),
  tx("2026-03-02", "Coffee", 4, "Food"),
  tx("2026-03-05", "Lunch", 12, "Food"),
  tx("2026-02-20", "Dinner", 30, "Food"),
  limit("2026-03-01", "Rent", 1200),
]

async function openDialog(bucket: BucketView = FOOD_MARCH, records: Array<CsvRecord> = RECORDS) {
  const view = await renderWithFile(
    <EditBucketDialog bucket={bucket}>
      <span>{bucket.category}</span>
    </EditBucketDialog>,
    { records }
  )
  await view.user.click(screen.getByText(bucket.category))
  const dialog = await screen.findByRole("dialog")
  return {
    ...view,
    dialog: within(dialog),
    categoryInput: () => within(dialog).getByLabelText("Category *"),
    limitInput: () => within(dialog).getByLabelText("Limit *"),
    saveButton: () => within(dialog).getByRole("button", { name: "Save" }),
    deleteButton: () => dialog.querySelector<HTMLButtonElement>("button.text-destructive")!,
    closed: waitForDialogToClose,
  }
}

describe("EditBucketDialog", () => {
  test("opens pre-filled for the bucket's month without month/year fields", async () => {
    const { dialog, categoryInput, limitInput } = await openDialog()

    expect(dialog.getByText("Edit Budget Bucket")).toBeInTheDocument()
    expect(dialog.getByText(/Food in March 2026/)).toBeInTheDocument()
    expect(categoryInput()).toHaveValue("Food")
    expect(limitInput()).toHaveValue(500)
    expect(dialog.queryByRole("combobox")).not.toBeInTheDocument()
    expect(dialog.queryByLabelText("Year *")).not.toBeInTheDocument()
  })

  test("renames the category on every row of that month and updates the limit", async () => {
    const { user, categoryInput, limitInput, saveButton, handle, closed } = await openDialog()

    await user.clear(categoryInput())
    await user.type(categoryInput(), "Groceries")
    await user.clear(limitInput())
    await user.type(limitInput(), "600")
    await user.click(saveButton())
    await closed()

    const rows = parseCsv(handle.content)
    expect(rows).toHaveLength(RECORDS.length)
    expect(rows).toContainEqual(tx("2026-03-02", "Coffee", 4, "Groceries"))
    expect(rows).toContainEqual(tx("2026-03-05", "Lunch", 12, "Groceries"))
    expect(rows).toContainEqual(limit("2026-03-01", "Groceries", 600))
    expect(rows).toContainEqual(tx("2026-02-20", "Dinner", 30, "Food"))
    expect(rows).toContainEqual(limit("2026-03-01", "Rent", 1200))
    expect(rows.filter((r) => r.date.startsWith("2026-03") && r.category === "Food")).toHaveLength(0)
  })

  test("a limit of 0 removes the limit row but keeps the transactions", async () => {
    const { user, limitInput, saveButton, handle, closed } = await openDialog()

    await user.clear(limitInput())
    await user.type(limitInput(), "0")
    await user.click(saveButton())
    await closed()

    const rows = parseCsv(handle.content)
    expect(rows).not.toContainEqual(limit("2026-03-01", "Food", 500))
    expect(rows).toContainEqual(tx("2026-03-02", "Coffee", 4, "Food"))
    expect(rows).toHaveLength(RECORDS.length - 1)
  })

  test("Save is disabled when the category is cleared", async () => {
    const { user, categoryInput, saveButton } = await openDialog()

    await user.clear(categoryInput())

    expect(saveButton()).toBeDisabled()
  })

  test("delete removes only the month's limit row", async () => {
    const { user, deleteButton, handle, closed } = await openDialog()

    await user.click(deleteButton())
    await closed()

    const rows = parseCsv(handle.content)
    expect(rows).toHaveLength(RECORDS.length - 1)
    expect(rows).not.toContainEqual(limit("2026-03-01", "Food", 500))
    expect(rows).toContainEqual(tx("2026-03-02", "Coffee", 4, "Food"))
    expect(rows).toContainEqual(limit("2026-03-01", "Rent", 1200))
  })
})
