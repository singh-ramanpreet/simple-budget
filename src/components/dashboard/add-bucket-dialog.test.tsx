import { describe, expect, test } from "bun:test"
import { screen, within } from "@testing-library/react"
import { limit, parseCsv, toCsv, tx } from "@test/csv"
import { createFakeFileHandle } from "@test/fake-file-system"
import { renderWithFile, waitForDialogToClose } from "@test/render"
import AddBucketDialog from "./add-bucket-dialog"
import type { CsvRecord } from "./types"
import type { FakeFileHandle } from "@test/fake-file-system"

const RECORDS: Array<CsvRecord> = [limit("2026-03-01", "Food", 500), tx("2026-03-02", "Coffee", 4, "Food")]

async function openDialog(records: Array<CsvRecord> = RECORDS, handle?: FakeFileHandle) {
  const view = await renderWithFile(<AddBucketDialog initialMonth={3} initialYear={2026} />, { records, handle })
  await view.user.click(screen.getByText("New Bucket"))
  const dialog = await screen.findByRole("dialog")
  return {
    ...view,
    dialog: within(dialog),
    categoryInput: () => within(dialog).getByLabelText("Category *"),
    limitInput: () => within(dialog).getByLabelText("Limit *"),
    saveButton: () => within(dialog).getByRole("button", { name: "Save" }),
    closed: waitForDialogToClose,
  }
}

describe("AddBucketDialog", () => {
  test("opens on the given month and year with Save disabled until filled in", async () => {
    const { user, dialog, categoryInput, limitInput, saveButton } = await openDialog()

    expect(dialog.getByText("New Bucket")).toBeInTheDocument()
    expect(dialog.getByRole("combobox")).toHaveTextContent("March")
    expect(dialog.getByLabelText("Year *")).toHaveValue(2026)
    expect(saveButton()).toBeDisabled()

    await user.type(categoryInput(), "Travel")
    expect(saveButton()).toBeDisabled()

    await user.type(limitInput(), "300")
    expect(saveButton()).toBeEnabled()
  })

  test("writes a limit record dated the first of the month", async () => {
    const { user, categoryInput, limitInput, saveButton, handle, closed } = await openDialog()

    await user.type(categoryInput(), "Travel")
    await user.type(limitInput(), "300")
    await user.click(saveButton())
    await closed()

    expect(parseCsv(handle.content)).toContainEqual(limit("2026-03-01", "Travel", 300))
    expect(parseCsv(handle.content)).toHaveLength(RECORDS.length + 1)
  })

  test("replaces an existing limit for the same category and month", async () => {
    const { user, categoryInput, limitInput, saveButton, handle, closed } = await openDialog()

    await user.type(categoryInput(), "Food")
    await user.type(limitInput(), "750")
    await user.click(saveButton())
    await closed()

    const rows = parseCsv(handle.content)
    const foodLimits = rows.filter((r) => r.name === "" && r.category === "Food")
    expect(foodLimits).toEqual([limit("2026-03-01", "Food", 750)])
    expect(rows).toContainEqual(tx("2026-03-02", "Coffee", 4, "Food"))
  })

  test("a double-click on Save writes the bucket once", async () => {
    const handle = createFakeFileHandle({ content: toCsv(RECORDS), writeDelayMs: 80 })
    const { user, categoryInput, limitInput, saveButton, closed } = await openDialog(RECORDS, handle)

    await user.type(categoryInput(), "Travel")
    await user.type(limitInput(), "300")
    await user.dblClick(saveButton())
    await closed()

    expect(handle.writes).toHaveLength(1)
    const rows = parseCsv(handle.content)
    expect(rows.filter((r) => r.category === "Travel")).toEqual([limit("2026-03-01", "Travel", 300)])
  })

  test("can target a different month and year", async () => {
    const { user, dialog, categoryInput, limitInput, saveButton, handle, closed } = await openDialog()

    await user.click(dialog.getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "May" }))
    await user.clear(dialog.getByLabelText("Year *"))
    await user.type(dialog.getByLabelText("Year *"), "2027")
    await user.type(categoryInput(), "Travel")
    await user.type(limitInput(), "300")
    await user.click(saveButton())
    await closed()

    expect(parseCsv(handle.content)).toContainEqual(limit("2027-05-01", "Travel", 300))
  })

  test("cancelling resets the form for the next open", async () => {
    const { user, dialog, categoryInput, handle, closed } = await openDialog()

    await user.type(categoryInput(), "Travel")
    await user.click(dialog.getByRole("button", { name: "Cancel" }))
    await closed()

    await user.click(screen.getByText("New Bucket"))
    const reopened = within(await screen.findByRole("dialog"))
    expect(reopened.getByLabelText("Category *")).toHaveValue("")
    expect(handle.writes).toHaveLength(0)
  })
})
