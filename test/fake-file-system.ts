/**
 * In-memory stand-ins for the two browser facilities the app depends on:
 *
 *  1. `FileSystemFileHandle` from the File System Access API (`createFakeFileHandle`).
 *  2. The IndexedDB helpers in src/lib/file-storage.ts (`fakeStorage.module`),
 *     which ./setup.ts installs with `mock.module` for every test file.
 *
 * Together they let the real `FileHandleProvider` run end-to-end in tests:
 * it "restores" the handle from storage, reads the CSV, and writes back on save.
 */

export interface FakeFileHandle extends FileSystemFileHandle {
  /** Current text content of the fake file */
  readonly content: string
  /** Every full document written through createWritable(), oldest first */
  readonly writes: Array<string>
  /** Change the permission the handle reports on the next query */
  setPermission: (state: PermissionState) => void
}

export interface FakeFileHandleOptions {
  name?: string
  /** Full CSV text of the file. Defaults to just the header row. */
  content?: string
  /** Permission state reported by queryPermission(). requestPermission() always grants. */
  permission?: PermissionState
}

export function createFakeFileHandle(options: FakeFileHandleOptions = {}): FakeFileHandle {
  let content = options.content ?? "date,name,amount,category,category_limit,notes"
  let permission: PermissionState = options.permission ?? "granted"
  const writes: Array<string> = []

  const handle = {
    kind: "file" as const,
    name: options.name ?? "budget.csv",
    writes,
    get content() {
      return content
    },
    setPermission(state: PermissionState) {
      permission = state
    },
    getFile() {
      const file = { name: handle.name, text: () => Promise.resolve(content) }
      return Promise.resolve(file as unknown as File)
    },
    queryPermission() {
      return Promise.resolve(permission)
    },
    requestPermission() {
      permission = "granted"
      return Promise.resolve(permission)
    },
    createWritable() {
      let buffer = ""
      const writable = {
        write(chunk: unknown) {
          buffer += String(chunk)
          return Promise.resolve()
        },
        close() {
          content = buffer
          writes.push(buffer)
          return Promise.resolve()
        },
        seek: () => Promise.resolve(),
        truncate: () => Promise.resolve(),
      }
      return Promise.resolve(writable as unknown as FileSystemWritableFileStream)
    },
    isSameEntry(other: FileSystemHandle) {
      return Promise.resolve(other === handle)
    },
  }

  return handle as FakeFileHandle
}

/* ------------------------------------------------------------------------- */
/* Replacement for src/lib/file-storage.ts                                   */
/* ------------------------------------------------------------------------- */

type Records = Array<Record<string, unknown>>

const store: { handle: FileSystemFileHandle | null; records: Records } = {
  handle: null,
  records: [],
}

/**
 * Control surface for the mocked storage layer. Seed it before rendering a
 * provider to simulate a returning user; inspect it to assert on what was persisted.
 */
export const fakeStorage = {
  /** The handle the provider would restore on mount (null = first visit) */
  get handle() {
    return store.handle
  },
  /** The cached records the provider falls back to when permission is missing */
  get records() {
    return store.records
  },
  seed(options: { handle?: FileSystemFileHandle | null; records?: ReadonlyArray<object> }) {
    if (options.handle !== undefined) store.handle = options.handle
    if (options.records !== undefined) store.records = [...options.records] as Records
  },
  reset() {
    store.handle = null
    store.records = []
  },

  /** Drop-in implementation of the `@/lib/file-storage` exports */
  module: {
    getFileHandle(): Promise<FileSystemFileHandle | null> {
      return Promise.resolve(store.handle)
    },
    setFileHandle(handle: FileSystemFileHandle): Promise<void> {
      store.handle = handle
      return Promise.resolve()
    },
    clearFileHandle(): Promise<void> {
      store.handle = null
      store.records = []
      return Promise.resolve()
    },
    getLocalData<T>(_key: "records"): Promise<Array<T>> {
      return Promise.resolve(store.records as Array<T>)
    },
    setLocalData<T>(_key: "records", data: Array<T>): Promise<void> {
      store.records = data as Records
      return Promise.resolve()
    },
    async verifyPermission(handle: FileSystemFileHandle, withWrite: boolean = true): Promise<boolean> {
      const options: FileSystemHandlePermissionDescriptor = { mode: withWrite ? "readwrite" : "read" }
      if ((await handle.queryPermission(options)) === "granted") return true
      return (await handle.requestPermission(options)) === "granted"
    },
  },
}
