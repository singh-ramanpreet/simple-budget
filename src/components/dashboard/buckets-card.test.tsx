import { describe, expect, mock, test } from "bun:test"
import { screen, within } from "@testing-library/react"
import { limit, tx } from "@test/csv"
import { renderWithFile } from "@test/render"
import BucketsCard from "./buckets-card"
import type { CsvRecord } from "./types"

async function renderCard(records: Array<CsvRecord>, month = 3, year = 2026) {
  const onNavigate = mock((_delta: number) => {})
  const onJump = mock((_month: number, _year: number) => {})
  const view = await renderWithFile(
    <BucketsCard records={records} month={month} year={year} onNavigate={onNavigate} onJump={onJump} />,
    { records }
  )
  return { ...view, onNavigate, onJump }
}

/** The <li> row for a bucket, found by its category heading */
function bucketRow(category: string) {
  return within(screen.getByText(category).closest("li")!)
}

describe("BucketsCard", () => {
  test("sums spending per category against its limit and shows a total row", async () => {
    await renderCard([
      limit("2026-03-01", "Food", 500),
      tx("2026-03-02", "Coffee", 50, "Food"),
      tx("2026-03-05", "Lunch", 75, "Food"),
      limit("2026-03-01", "Rent", 1200),
      tx("2026-03-01", "Rent", 1200, "Rent"),
    ])

    const food = bucketRow("Food")
    expect(food.getByText("$125.00")).toBeInTheDocument()
    expect(food.getByText("$500")).toBeInTheDocument()
    expect(food.getByText("25%")).toBeInTheDocument()

    const rent = bucketRow("Rent")
    expect(rent.getByText("$1200.00")).toBeInTheDocument()
    expect(rent.getByText("100%")).toBeInTheDocument()

    const total = bucketRow("Total")
    expect(total.getByText("$1325.00")).toBeInTheDocument()
    expect(total.getByText("$1700")).toBeInTheDocument()
    expect(total.getByText("78%")).toBeInTheDocument()
  })

  test("highlights a category that is over its limit", async () => {
    await renderCard([limit("2026-03-01", "Food", 100), tx("2026-03-02", "Feast", 150, "Food")])

    const food = bucketRow("Food")
    expect(food.getByText("$150.00")).toHaveClass("text-red-500")
    expect(food.getByText("150%")).toBeInTheDocument()
  })

  test("does not highlight a category within its limit", async () => {
    await renderCard([limit("2026-03-01", "Food", 100), tx("2026-03-02", "Snack", 20, "Food")])

    expect(bucketRow("Food").getByText("$20.00")).not.toHaveClass("text-red-500")
  })

  test("shows categories that have spending but no limit at 0%", async () => {
    await renderCard([tx("2026-03-02", "Gift", 20, "Misc")])

    const misc = bucketRow("Misc")
    expect(misc.getByText("$20.00")).toBeInTheDocument()
    expect(misc.getByText("$0")).toBeInTheDocument()
    expect(misc.getByText("0%")).toBeInTheDocument()
  })

  test("ignores records from other months", async () => {
    await renderCard([limit("2026-04-01", "Food", 500), tx("2026-02-02", "Coffee", 4, "Food")])

    expect(screen.queryByText("Food")).not.toBeInTheDocument()
    expect(screen.getByText("No buckets this month.")).toBeInTheDocument()
  })

  test("month navigation is delegated to the parent", async () => {
    const { user, onNavigate, container } = await renderCard([])

    const arrows = container.querySelectorAll("svg.cursor-pointer")
    await user.click(arrows[arrows.length - 1])

    expect(onNavigate).toHaveBeenCalledWith(1)
  })
})
