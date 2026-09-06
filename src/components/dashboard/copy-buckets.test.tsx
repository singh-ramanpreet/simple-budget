import { describe, expect, test } from "bun:test"
import { screen, within } from "@testing-library/react"
import { limit, parseCsv, tx } from "@test/csv"
import { renderWithFile, waitForDialogToClose } from "@test/render"
import CopyBuckets from "./copy-buckets"
import type { CsvRecord } from "./types"

const RECORDS: Array<CsvRecord> = [
  limit("2026-02-01", "Food", 500),
  limit("2026-02-01", "Rent", 1200),
  tx("2026-02-03", "Coffee", 4, "Food"),
  limit("2026-03-01", "Rent", 1200),
]

async function openDialog(records: Array<CsvRecord> = RECORDS, month = 3, year = 2026) {
  const view = await renderWithFile(<CopyBuckets month={month} year={year} />, { records })
  await view.user.click(screen.getByText("Copy Buckets"))
  const dialog = await screen.findByRole("dialog")
  return {
    ...view,
    dialog: within(dialog),
    continueButton: () => within(dialog).getByRole("button", { name: "Continue" }),
    closed: waitForDialogToClose,
  }
}

describe("CopyBuckets", () => {
  test("lists previous-month buckets that are missing from the current month", async () => {
    const { dialog, continueButton } = await openDialog()

    expect(dialog.getByText(/February 2026/)).toBeInTheDocument()
    expect(dialog.getByText(/March 2026/)).toBeInTheDocument()
    expect(dialog.getByText("The following buckets will be added:")).toBeInTheDocument()

    const list = within(dialog.getByRole("list"))
    expect(list.getByText("Food")).toBeInTheDocument()
    expect(list.getByText("$500")).toBeInTheDocument()
    expect(list.queryByText("Rent")).not.toBeInTheDocument()
    expect(continueButton()).toBeEnabled()
  })

  test("copies the missing buckets into the current month", async () => {
    const { user, continueButton, handle, closed } = await openDialog()

    await user.click(continueButton())
    await closed()

    const rows = parseCsv(handle.content)
    expect(rows).toHaveLength(RECORDS.length + 1)
    expect(rows).toContainEqual(limit("2026-03-01", "Food", 500))
    expect(rows).toContainEqual(limit("2026-02-01", "Food", 500))
    expect(rows.filter((r) => r.name === "" && r.category === "Rent")).toHaveLength(2)
  })

  test("shows an empty state and disables Continue when nothing is missing", async () => {
    const { dialog, continueButton, handle } = await openDialog([
      limit("2026-02-01", "Food", 500),
      limit("2026-03-01", "Food", 500),
    ])

    expect(dialog.getByText("No new buckets to copy from February.")).toBeInTheDocument()
    expect(continueButton()).toBeDisabled()
    expect(handle.writes).toHaveLength(0)
  })

  test("January copies from December of the previous year", async () => {
    const { dialog } = await openDialog([limit("2025-12-01", "Food", 500)], 1, 2026)

    expect(dialog.getByText(/December 2025/)).toBeInTheDocument()
    expect(dialog.getByText(/January 2026/)).toBeInTheDocument()
    expect(within(dialog.getByRole("list")).getByText("Food")).toBeInTheDocument()
  })

  test("cancelling writes nothing", async () => {
    const { user, dialog, handle, closed } = await openDialog()

    await user.click(dialog.getByRole("button", { name: "Cancel" }))
    await closed()

    expect(handle.writes).toHaveLength(0)
  })
})
