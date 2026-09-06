import { afterAll, beforeAll, describe, expect, setSystemTime, test } from "bun:test"
import { act, screen, within } from "@testing-library/react"
import { limit, parseCsv, tx } from "@test/csv"
import { renderWithFile, waitForDialogToClose } from "@test/render"
import AddTransactionDialog from "./add-transaction-dialog"
import type { CsvRecord } from "./types"

const TODAY = new Date(2026, 2, 15, 12)

const MARCH: Array<CsvRecord> = [
  limit("2026-03-01", "Food", 500),
  limit("2026-03-01", "Rent", 1200),
  tx("2026-03-02", "Coffee", 4, "Food", "latte"),
]

beforeAll(() => setSystemTime(TODAY))
afterAll(() => setSystemTime())

async function openDialog(records: Array<CsvRecord> = MARCH) {
  const view = await renderWithFile(<AddTransactionDialog />, { records })
  await view.user.click(screen.getByText("New Transaction"))
  const dialog = await screen.findByRole("dialog")
  return {
    ...view,
    dialog: within(dialog),
    // The Name/Notes inputs carry a datalist and so are comboboxes too; target the Select trigger
    categorySelect: () => dialog.querySelector<HTMLElement>('[data-slot="select-trigger"]')!,
    saveButton: () => within(dialog).getByRole("button", { name: "Save" }),
  }
}

describe("AddTransactionDialog", () => {
  test("opens on today's date with Save disabled until required fields are filled", async () => {
    const { user, dialog, categorySelect, saveButton } = await openDialog()

    expect(dialog.getByText("New Transaction")).toBeInTheDocument()
    expect(dialog.getByRole("button", { name: /March 15th, 2026/ })).toBeInTheDocument()
    expect(saveButton()).toBeDisabled()

    await user.type(dialog.getByPlaceholderText("Name"), "Lunch")
    expect(dialog.getByPlaceholderText("Name")).toHaveValue("Lunch")
    expect(saveButton()).toBeDisabled()

    await user.type(dialog.getByPlaceholderText("0.00"), "12.5")
    expect(dialog.getByPlaceholderText("0.00")).toHaveValue(12.5)
    expect(saveButton()).toBeDisabled()

    await user.click(categorySelect())
    await user.click(await screen.findByRole("option", { name: "Food" }))
    expect(categorySelect()).toHaveTextContent("Food")
    expect(saveButton()).toBeEnabled()
  })

  test("only offers categories that exist in the selected month", async () => {
    const { user, categorySelect } = await openDialog([...MARCH, limit("2026-02-01", "Travel", 300)])

    await user.click(categorySelect())

    expect(await screen.findByRole("option", { name: "Food" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Rent" })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: "Travel" })).not.toBeInTheDocument()
  })

  test("explains when the month has no categories yet", async () => {
    const { user, categorySelect } = await openDialog([limit("2026-02-01", "Travel", 300)])

    await user.click(categorySelect())

    expect(await screen.findByText(/No categories this month/)).toBeInTheDocument()
  })

  test("saves the new transaction to the CSV file and closes", async () => {
    const { user, dialog, categorySelect, saveButton, handle } = await openDialog()

    await user.type(dialog.getByPlaceholderText("Name"), "Lunch")
    await user.type(dialog.getByPlaceholderText("0.00"), "12.5")
    await user.click(categorySelect())
    await user.click(await screen.findByRole("option", { name: "Food" }))
    await user.type(dialog.getByPlaceholderText("Notes"), "work")
    await user.click(saveButton())

    await waitForDialogToClose()

    expect(handle.writes).toHaveLength(1)
    const rows = parseCsv(handle.content)
    expect(rows).toHaveLength(MARCH.length + 1)
    expect(rows).toContainEqual({
      date: "2026-03-15",
      name: "Lunch",
      amount: "12.5",
      category: "Food",
      category_limit: "0",
      notes: "work",
    })
  })

  test("pre-fills and opens when a transaction is copied", async () => {
    await renderWithFile(<AddTransactionDialog />, { records: MARCH })

    act(() => {
      window.dispatchEvent(
        new CustomEvent("copy-transaction", {
          detail: { name: "Coffee", amount: "4", category: "Food", notes: "latte", date: TODAY },
        })
      )
    })

    const dialogEl = await screen.findByRole("dialog")
    const dialog = within(dialogEl)
    expect(dialog.getByPlaceholderText("Name")).toHaveValue("Coffee")
    expect(dialog.getByPlaceholderText("0.00")).toHaveValue(4)
    expect(dialog.getByPlaceholderText("Notes")).toHaveValue("latte")
    expect(dialogEl.querySelector('[data-slot="select-trigger"]')).toHaveTextContent("Food")
    expect(dialog.getByRole("button", { name: "Save" })).toBeEnabled()
  })

  test("cancelling discards the draft", async () => {
    const { user, dialog, handle } = await openDialog()

    await user.type(dialog.getByPlaceholderText("Name"), "Draft")
    await user.click(dialog.getByRole("button", { name: "Cancel" }))
    await waitForDialogToClose()

    await user.click(screen.getByText("New Transaction"))
    const reopened = within(await screen.findByRole("dialog"))
    expect(reopened.getByPlaceholderText("Name")).toHaveValue("")
    expect(handle.writes).toHaveLength(0)
  })
})
