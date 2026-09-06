import { afterEach, describe, expect, mock, test } from "bun:test"
import { screen, waitFor } from "@testing-library/react"
import { CSV_HEADER, toCsv, tx } from "@test/csv"
import { createFakeFileHandle, fakeStorage } from "@test/fake-file-system"
import { renderWithFile } from "@test/render"
import { useFileHandle } from "./providers/file-handle-provider"
import { FileHandleManager } from "./file-handle-manager"

/** Exposes how many records the provider currently holds */
function RecordCount() {
  const { data } = useFileHandle()
  return <output data-testid="record-count">{data.length}</output>
}

const RECORDS = [tx("2026-03-02", "Coffee", 4, "Food"), tx("2026-03-05", "Bus", 3, "Transport")]

const abortError = () => Object.assign(new Error("The user aborted a request."), { name: "AbortError" })

afterEach(() => {
  // @ts-expect-error -- happy-dom does not implement the File System Access API
  delete window.showOpenFilePicker
  // @ts-expect-error -- happy-dom does not implement the File System Access API
  delete window.showSaveFilePicker
})

describe("FileHandleManager", () => {
  test("offers to pick or create a CSV on first visit", async () => {
    await renderWithFile(<FileHandleManager />, { noFile: true })

    expect(screen.getByText("No CSV Connected")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Pick CSV" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Create New" })).toBeInTheDocument()
  })

  test("picking a CSV connects it, remembers it and loads its rows", async () => {
    const handle = createFakeFileHandle({ name: "money.csv", content: toCsv(RECORDS) })
    window.showOpenFilePicker = mock(() => Promise.resolve([handle]))
    const { user } = await renderWithFile(
      <>
        <FileHandleManager />
        <RecordCount />
      </>,
      { noFile: true }
    )

    await user.click(screen.getByRole("button", { name: "Pick CSV" }))

    // The file name is shown in the header and again in the "saving to" notice
    expect(await screen.findAllByText("money.csv")).toHaveLength(2)
    expect(screen.getByText("Connected")).toBeInTheDocument()
    expect(screen.getByText(/Saving changes directly to:/)).toBeInTheDocument()
    expect(screen.getByTestId("record-count")).toHaveTextContent("2")
    expect(fakeStorage.handle).toBe(handle)
    expect(fakeStorage.records).toHaveLength(2)
  })

  test("cancelling the picker keeps the empty state", async () => {
    window.showOpenFilePicker = mock(() => Promise.reject(abortError()))
    const { user } = await renderWithFile(<FileHandleManager />, { noFile: true })

    await user.click(screen.getByRole("button", { name: "Pick CSV" }))

    expect(screen.getByText("No CSV Connected")).toBeInTheDocument()
    expect(fakeStorage.handle).toBeNull()
  })

  test("creating a new file writes the CSV header and connects it", async () => {
    const handle = createFakeFileHandle({ name: "budget.csv", content: "" })
    window.showSaveFilePicker = mock(() => Promise.resolve(handle))
    const { user } = await renderWithFile(<FileHandleManager />, { noFile: true })

    await user.click(screen.getByRole("button", { name: "Create New" }))

    expect(await screen.findAllByText("budget.csv")).toHaveLength(2)
    expect(screen.getByText("Connected")).toBeInTheDocument()
    expect(handle.content).toBe(CSV_HEADER)
    expect(fakeStorage.handle).toBe(handle)
  })

  test("a remembered file without permission shows cached rows until access is granted", async () => {
    fakeStorage.seed({ records: [RECORDS[0]] })
    const { user, handle } = await renderWithFile(
      <>
        <FileHandleManager />
        <RecordCount />
      </>,
      { records: RECORDS, permission: "prompt" }
    )

    expect(screen.getByText("Permission Needed")).toBeInTheDocument()
    expect(screen.queryByText(/Saving changes directly to:/)).not.toBeInTheDocument()
    expect(screen.getByTestId("record-count")).toHaveTextContent("1")

    await user.click(screen.getByRole("button", { name: "Grant" }))

    expect(await screen.findByText("Connected")).toBeInTheDocument()
    expect(screen.getByText(/Saving changes directly to:/)).toBeInTheDocument()
    await waitFor(() => expect(screen.getByTestId("record-count")).toHaveTextContent("2"))
    expect(await handle.queryPermission()).toBe("granted")
  })

  test("a remembered file with permission is connected immediately", async () => {
    await renderWithFile(
      <>
        <FileHandleManager />
        <RecordCount />
      </>,
      { records: RECORDS }
    )

    expect(screen.getByText("Connected")).toBeInTheDocument()
    expect(screen.getByTestId("record-count")).toHaveTextContent("2")
  })

  test("Reset disconnects the file and clears cached rows", async () => {
    const { user } = await renderWithFile(
      <>
        <FileHandleManager />
        <RecordCount />
      </>,
      { records: RECORDS }
    )

    await user.click(screen.getByRole("button", { name: "Reset" }))

    expect(await screen.findByText("No CSV Connected")).toBeInTheDocument()
    expect(screen.getByTestId("record-count")).toHaveTextContent("0")
    expect(fakeStorage.handle).toBeNull()
    expect(fakeStorage.records).toHaveLength(0)
  })
})
