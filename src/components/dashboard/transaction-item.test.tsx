import { describe, expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import { tx } from "@test/csv"
import TransactionItem from "./transaction-item"

describe("TransactionItem", () => {
  test("shows name, notes, category and a two-decimal amount", () => {
    render(<TransactionItem record={tx("2026-03-07", "Coffee", "4.5", "Food", "latte")} />)

    expect(screen.getByText("Coffee")).toBeInTheDocument()
    expect(screen.getByText("latte")).toBeInTheDocument()
    expect(screen.getByText("Food")).toBeInTheDocument()
    expect(screen.getByText("$4.50")).toBeInTheDocument()
  })

  test("renders the date pill from the local calendar date without timezone drift", () => {
    render(<TransactionItem record={tx("2026-03-01", "Rent", "1200", "Housing")} />)

    expect(screen.getByText("Mar")).toBeInTheDocument()
    expect(screen.getByText("1")).toBeInTheDocument()
  })

  test("shows the absolute value of negative amounts", () => {
    render(<TransactionItem record={tx("2026-03-07", "Refund", "-12", "Food")} />)

    expect(screen.getByText("$12.00")).toBeInTheDocument()
  })

  test("falls back to $0.00 for an unparsable amount", () => {
    render(<TransactionItem record={tx("2026-03-07", "Oops", "abc", "Food")} />)

    expect(screen.getByText("$0.00")).toBeInTheDocument()
  })
})
