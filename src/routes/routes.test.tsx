/**
 * Page-level tests: the real router, root layout, nav bar and every route,
 * mounted on an in-memory history.
 */
import { afterAll, beforeAll, describe, expect, setSystemTime, test } from "bun:test"
import { screen, waitFor } from "@testing-library/react"
import { limit, toCsv, tx } from "@test/csv"
import { createFakeFileHandle, fakeStorage } from "@test/fake-file-system"
import { renderApp } from "@test/render"

const TODAY = new Date(2026, 2, 15, 12)

const RECORDS = [limit("2026-03-01", "Food", 500), tx("2026-03-02", "Coffee", 4, "Food")]

beforeAll(() => setSystemTime(TODAY))
afterAll(() => setSystemTime())

function connectFile() {
  fakeStorage.seed({ handle: createFakeFileHandle({ content: toCsv(RECORDS) }) })
}

describe("app routes", () => {
  test("home asks to connect a file on first visit", async () => {
    await renderApp("/")

    expect(await screen.findByText("Welcome to Simple Budget")).toBeInTheDocument()
    expect(screen.getByText("No CSV Connected")).toBeInTheDocument()
  })

  test("home shows the dashboard for the current month once a file is connected", async () => {
    connectFile()
    await renderApp("/")

    expect(await screen.findByText("Coffee")).toBeInTheDocument()
    expect(screen.getByText("Transactions")).toBeInTheDocument()
    expect(screen.getByText("Buckets")).toBeInTheDocument()
    expect(screen.getAllByRole("combobox")[0]).toHaveTextContent("March")
    // The Food limit and the total row both read $500
    expect(screen.getAllByText("$500")).toHaveLength(2)
  })

  test("the nav bar moves between pages", async () => {
    const { user, router } = await renderApp("/")
    await screen.findByText("Welcome to Simple Budget")

    await user.click(screen.getByRole("link", { name: /settings/i }))
    expect(await screen.findByText("Manage your application preferences and data storage.")).toBeInTheDocument()
    expect(router.state.location.pathname).toBe("/settings")

    await user.click(screen.getByRole("link", { name: /charts/i }))
    expect(await screen.findByText(/Please connect a file/)).toBeInTheDocument()
    expect(router.state.location.pathname).toBe("/charts")

    await user.click(screen.getByRole("link", { name: /home/i }))
    expect(await screen.findByText("Welcome to Simple Budget")).toBeInTheDocument()
    expect(router.state.location.pathname).toBe("/")
  })

  test("settings switches the theme and remembers it", async () => {
    const { user } = await renderApp("/settings")
    await screen.findByText("Appearance")

    await user.click(screen.getByRole("button", { name: "Dark" }))
    expect(document.documentElement).toHaveClass("dark")
    expect(localStorage.getItem("simple-budget-theme")).toBe("dark")

    await user.click(screen.getByRole("button", { name: "Light" }))
    expect(document.documentElement).toHaveClass("light")
    expect(document.documentElement).not.toHaveClass("dark")
    expect(localStorage.getItem("simple-budget-theme")).toBe("light")
  })

  test("settings starts from the remembered theme", async () => {
    localStorage.setItem("simple-budget-theme", "dark")
    await renderApp("/settings")
    await screen.findByText("Appearance")

    await waitFor(() => expect(document.documentElement).toHaveClass("dark"))
  })

  test("settings hosts the file connection controls", async () => {
    connectFile()
    await renderApp("/settings")

    expect(await screen.findAllByText("budget.csv")).toHaveLength(2)
    expect(screen.getByText("Connected")).toBeInTheDocument()
  })

  test("charts renders the trend controls for a connected file", async () => {
    connectFile()
    await renderApp("/charts")

    expect(await screen.findByText("Spending Trends")).toBeInTheDocument()
    expect(screen.getByText("View Options")).toBeInTheDocument()
    expect(screen.getByText("Time Range")).toBeInTheDocument()
  })

  test("unknown paths show the not-found card with a way home", async () => {
    const { user } = await renderApp("/does-not-exist")

    expect(await screen.findByText("Page not found.")).toBeInTheDocument()
    await user.click(screen.getByRole("link", { name: "Go to home" }))
    expect(await screen.findByText("Welcome to Simple Budget")).toBeInTheDocument()
  })
})
