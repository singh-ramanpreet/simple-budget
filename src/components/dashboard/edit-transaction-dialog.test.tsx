import { afterAll, beforeAll, describe, expect, setSystemTime, test } from "bun:test"
import { screen, within } from "@testing-library/react"
import { limit, parseCsv, tx } from "@test/csv"
import { renderWithFile, waitForDialogToClose } from "@test/render"
import EditTransactionDialog from "./edit-transaction-dialog"
import AddTransactionDialog from "./add-transaction-dialog"
import TransactionItem from "./transaction-item"
import type { CsvRecord } from "./types"

const TODAY = new Date(2026, 2, 15, 12)

const COFFEE = tx("2026-03-02", "Coffee", 4, "Food", "latte")
const RECORDS: Array<CsvRecord> = [limit("2026-03-01", "Food", 500), COFFEE, tx("2026-03-05", "Bus", 3, "Transport")]

beforeAll(() => setSystemTime(TODAY))
afterAll(() => setSystemTime())

async function openDialog(record: CsvRecord = COFFEE, records: Array<CsvRecord> = RECORDS) {
  const view = await renderWithFile(
    <>
      <EditTransactionDialog record={record}>
        <TransactionItem record={record} />
      </EditTransactionDialog>
      <AddTransactionDialog />
    </>,
    { records }
  )
  await view.user.click(screen.getByText(record.name))
  const dialog = await screen.findByRole("dialog")
  return {
    ...view,
    dialog: within(dialog),
    // The Name/Notes inputs carry a datalist and so are comboboxes too; target the Select trigger
    categorySelect: () => dialog.querySelector<HTMLElement>('[data-slot="select-trigger"]')!,
    deleteButton: () => dialog.querySelector<HTMLButtonElement>("button.text-destructive")!,
    closed: waitForDialogToClose,
  }
}

describe("EditTransactionDialog", () => {
  test("opens pre-filled with the transaction's values", async () => {
    const { dialog, categorySelect } = await openDialog()

    expect(dialog.getByText("Edit Transaction")).toBeInTheDocument()
    expect(dialog.getByRole("button", { name: /March 2nd, 2026/ })).toBeInTheDocument()
    expect(dialog.getByPlaceholderText("Name")).toHaveValue("Coffee")
    expect(dialog.getByPlaceholderText("0.00")).toHaveValue(4)
    expect(categorySelect()).toHaveTextContent("Food")
    expect(dialog.getByPlaceholderText("Notes")).toHaveValue("latte")
    expect(dialog.getByRole("button", { name: "Save" })).toBeEnabled()
  })

  test("saves edits back to the CSV file", async () => {
    const { user, dialog, handle, closed } = await openDialog()

    await user.clear(dialog.getByPlaceholderText("0.00"))
    await user.type(dialog.getByPlaceholderText("0.00"), "6")
    await user.clear(dialog.getByPlaceholderText("Notes"))
    await user.type(dialog.getByPlaceholderText("Notes"), "oat latte")
    await user.click(dialog.getByRole("button", { name: "Save" }))
    await closed()

    const rows = parseCsv(handle.content)
    expect(rows).toHaveLength(RECORDS.length)
    expect(rows).toContainEqual({ ...COFFEE, amount: "6", notes: "oat latte" })
    expect(rows).not.toContainEqual(COFFEE)
  })

  test("deletes only the edited transaction", async () => {
    const { user, handle, deleteButton, closed } = await openDialog()

    await user.click(deleteButton())
    await closed()

    const rows = parseCsv(handle.content)
    expect(rows).toHaveLength(RECORDS.length - 1)
    expect(rows).not.toContainEqual(COFFEE)
    expect(rows.map((r) => r.name)).toEqual(["", "Bus"])
  })

  test("cancelling leaves the file untouched", async () => {
    const { user, dialog, handle, closed } = await openDialog()

    await user.type(dialog.getByPlaceholderText("Name"), " extra")
    await user.click(dialog.getByRole("button", { name: "Cancel" }))
    await closed()

    expect(handle.writes).toHaveLength(0)
  })

  test("Copy opens a new transaction with the same details dated today", async () => {
    const { user, dialog } = await openDialog()

    await user.click(dialog.getByRole("button", { name: "Copy" }))

    const copyEl = await screen.findByRole("dialog")
    const copy = within(copyEl)
    expect(copy.getByText("New Transaction")).toBeInTheDocument()
    expect(copy.getByRole("button", { name: /March 15th, 2026/ })).toBeInTheDocument()
    expect(copy.getByPlaceholderText("Name")).toHaveValue("Coffee")
    expect(copy.getByPlaceholderText("0.00")).toHaveValue(4)
    expect(copy.getByPlaceholderText("Notes")).toHaveValue("latte")
    expect(copyEl.querySelector('[data-slot="select-trigger"]')).toHaveTextContent("Food")
  })

  test("copying from another month drops the category", async () => {
    const january = tx("2026-01-10", "Coffee", 4, "Food", "latte")
    const { user, dialog } = await openDialog(january, [limit("2026-01-01", "Food", 500), january])

    await user.click(dialog.getByRole("button", { name: "Copy" }))

    const copyEl = await screen.findByRole("dialog")
    const copy = within(copyEl)
    expect(copy.getByText("New Transaction")).toBeInTheDocument()
    expect(copy.getByPlaceholderText("Name")).toHaveValue("Coffee")
    expect(copyEl.querySelector('[data-slot="select-trigger"]')).not.toHaveTextContent("Food")
    expect(copy.getByRole("button", { name: "Save" })).toBeDisabled()
  })
})
