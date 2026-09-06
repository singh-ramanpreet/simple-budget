import { describe, expect, mock, test } from "bun:test"
import { screen, within } from "@testing-library/react"
import { limit, tx } from "@test/csv"
import { renderWithFile, waitForDialogToClose } from "@test/render"
import TransactionsCard from "./transactions-card"
import type { CsvRecord } from "./types"

async function renderCard(records: Array<CsvRecord>, month = 3, year = 2026) {
  const onNavigate = mock((_delta: number) => {})
  const onJump = mock((_month: number, _year: number) => {})
  const view = await renderWithFile(
    <TransactionsCard records={records} month={month} year={year} onNavigate={onNavigate} onJump={onJump} />,
    { records }
  )
  return { ...view, onNavigate, onJump }
}

/** The filter icon is the dialog trigger inside the card title */
function filterTrigger() {
  const title = screen.getByText("Transactions").closest('[data-slot="card-title"]')!
  return title.querySelector<HTMLElement>('[data-slot="dialog-trigger"]')!
}

function dayHeading(year: number, month: number, day: number) {
  return new Date(year, month - 1, day).toLocaleDateString("default", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

describe("TransactionsCard", () => {
  test("lists only the selected month's transactions and hides limit rows", async () => {
    await renderCard([
      tx("2026-03-07", "Coffee", 4, "Food"),
      tx("2026-02-20", "Rent", 1200, "Housing"),
      limit("2026-03-01", "Food", 500),
    ])

    expect(screen.getByText("Coffee")).toBeInTheDocument()
    expect(screen.queryByText("Rent")).not.toBeInTheDocument()
    expect(screen.queryByText("$500.00")).not.toBeInTheDocument()
  })

  test("shows an empty message when the month has no transactions", async () => {
    await renderCard([tx("2026-02-20", "Rent", 1200, "Housing")])

    expect(screen.getByText("No transactions this month.")).toBeInTheDocument()
  })

  test("groups transactions by day, newest day first", async () => {
    await renderCard([
      tx("2026-03-02", "Bus", 3, "Transport"),
      tx("2026-03-07", "Coffee", 4, "Food"),
      tx("2026-03-07", "Lunch", 12, "Food"),
    ])

    const day7 = screen.getByText(dayHeading(2026, 3, 7))
    const day2 = screen.getByText(dayHeading(2026, 3, 2))
    expect(day7.compareDocumentPosition(day2) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    const day7Group = day7.parentElement!
    expect(within(day7Group).getByText("Coffee")).toBeInTheDocument()
    expect(within(day7Group).getByText("Lunch")).toBeInTheDocument()
    expect(within(day7Group).queryByText("Bus")).not.toBeInTheDocument()
  })

  test("month navigation is delegated to the parent", async () => {
    const { user, onNavigate, container } = await renderCard([])

    // The header holds the filter icon; the month arrows live in the card body
    await user.click(container.querySelector('[data-slot="card-content"] svg.cursor-pointer')!)

    expect(onNavigate).toHaveBeenCalledWith(-1)
  })

  test("paginates ten transactions per page", async () => {
    const records = Array.from({ length: 12 }, (_, i) =>
      tx(`2026-03-${String(i + 1).padStart(2, "0")}`, `Item ${i + 1}`, i + 1, "Misc")
    )
    const { user } = await renderCard(records)

    expect(screen.getByText("Item 12")).toBeInTheDocument()
    expect(screen.getByText("Item 3")).toBeInTheDocument()
    expect(screen.queryByText("Item 2")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Prev" })).toBeDisabled()

    await user.click(screen.getByRole("button", { name: "Next" }))

    expect(screen.getByText("Item 2")).toBeInTheDocument()
    expect(screen.getByText("Item 1")).toBeInTheDocument()
    expect(screen.queryByText("Item 12")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled()

    await user.click(screen.getByRole("button", { name: "1" }))
    expect(screen.getByText("Item 12")).toBeInTheDocument()
  })

  test("does not show pagination controls for a single page", async () => {
    await renderCard([tx("2026-03-07", "Coffee", 4, "Food")])

    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument()
  })

  test("filters by category and clears the filter again", async () => {
    const { user } = await renderCard([tx("2026-03-07", "Coffee", 4, "Food"), tx("2026-03-08", "Bus", 3, "Transport")])

    await user.click(filterTrigger())
    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText("Category Filter")).toBeInTheDocument()

    await user.click(within(dialog).getByRole("combobox"))
    await user.click(await screen.findByRole("option", { name: "Food" }))
    await user.click(within(dialog).getByRole("button", { name: "Apply" }))

    await waitForDialogToClose()
    expect(screen.getByText("Coffee")).toBeInTheDocument()
    expect(screen.queryByText("Bus")).not.toBeInTheDocument()

    await user.click(filterTrigger())
    await user.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Clear" }))

    await waitForDialogToClose()
    expect(screen.getByText("Coffee")).toBeInTheDocument()
    expect(screen.getByText("Bus")).toBeInTheDocument()
  })

  test("applying without choosing a category keeps the dialog open", async () => {
    const { user } = await renderCard([tx("2026-03-07", "Coffee", 4, "Food")])

    await user.click(filterTrigger())
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Apply" }))

    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})
