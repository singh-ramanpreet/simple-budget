/**
 * Render helpers that boot the real providers around the component under test.
 *
 *  - `renderWithFile` wraps `ui` in `FileHandleProvider`, backed by a fake CSV
 *    file handle, and resolves once the provider has finished loading.
 *  - `renderApp` mounts the whole router (all routes + nav bar) on an
 *    in-memory history, for page-level tests.
 */
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RouterProvider, createMemoryHistory } from "@tanstack/react-router"
import { createFakeFileHandle, fakeStorage } from "./fake-file-system"
import { toCsv } from "./csv"
import type { FakeFileHandle } from "./fake-file-system"
import type { ReactNode } from "react"
import type { CsvRecord } from "@/components/dashboard/types"
import { FileHandleProvider, useFileHandle } from "@/components/providers/file-handle-provider"
import { getRouter } from "@/router"

export interface RenderWithFileOptions {
  /** Rows to put in the CSV file (header is added automatically) */
  records?: Array<CsvRecord>
  /** Permission the restored handle reports. Defaults to "granted". */
  permission?: PermissionState
  /** Use a pre-built handle instead of creating one from `records` */
  handle?: FakeFileHandle
  /** Render without any stored handle (first-visit state) */
  noFile?: boolean
}

/**
 * Resolves once no dialog is open. Throws a plain Error on timeout instead of a
 * jest-dom assertion: serialising a happy-dom element into a failure message is
 * extremely slow and can exhaust memory.
 */
export function waitForDialogToClose() {
  return waitFor(() => {
    if (screen.queryByRole("dialog")) throw new Error("Expected the dialog to be closed")
  })
}

/** Renders a hidden marker once the provider has finished its initial load */
function ProviderReady() {
  const { isLoading } = useFileHandle()
  return isLoading ? null : <span data-testid="file-provider-ready" hidden />
}

export async function renderWithFile(ui: ReactNode, options: RenderWithFileOptions = {}) {
  const handle =
    options.handle ?? createFakeFileHandle({ content: toCsv(options.records ?? []), permission: options.permission })

  if (!options.noFile) {
    fakeStorage.seed({ handle })
  }

  const user = userEvent.setup()
  const result = render(
    <FileHandleProvider>
      <ProviderReady />
      {ui}
    </FileHandleProvider>
  )
  await screen.findByTestId("file-provider-ready")

  return { ...result, handle, user }
}

export async function renderApp(initialPath: string = "/") {
  const router = getRouter()
  router.update({ history: createMemoryHistory({ initialEntries: [initialPath] }) })

  const user = userEvent.setup()
  const result = render(<RouterProvider router={router} />)
  // The root layout renders the nav bar once the initial route has loaded
  await screen.findByRole("navigation")

  return { ...result, router, user }
}
