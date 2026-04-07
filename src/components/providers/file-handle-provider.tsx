"use client"

/**
 * FileHandleProvider
 *
 * This provider manages the application's connection to the local file system.
 * It implements a "Local-First" architecture where:
 * 1. Data is primarily read/written to a local CSV file chosen by the user.
 * 2. An IndexedDB cache is maintained for high-performance UI updates and
 *    immediate visibility on page load.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  getFileHandle,
  setFileHandle,
  verifyPermission,
  clearFileHandle as clearStoredHandle,
  getLocalData,
  setLocalData,
} from "@/lib/file-storage"

interface FileHandleContextType {
  fileHandle: FileSystemFileHandle | null
  hasPermission: boolean
  isLoading: boolean

  /** Triggers the browser's native file picker dialog */
  pickFile: () => Promise<void>

  /** Requests 'readwrite' permission for the existing file handle */
  requestAccess: () => Promise<boolean>

  /** Disconnects the file and wipes all local caches */
  clearHandle: () => Promise<void>

  /** Global shared state: Unified list of all records (Denormalized) */
  data: Record<string, unknown>[]

  /** Updates the shared state and persists changes back to the CSV in the background */
  setData: (newData: Record<string, unknown>[]) => Promise<void>

  /** Forces a refresh from the physical CSV file */
  syncWithFile: () => Promise<void>
}

const FileHandleContext = createContext<FileHandleContextType | undefined>(undefined)

export function FileHandleProvider({ children }: { children: React.ReactNode }) {
  const [fileHandle, setFileHandleState] = useState<FileSystemFileHandle | null>(null)
  const [hasPermission, setHasPermission] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [data, setDataState] = useState<Record<string, unknown>[]>([])

  /**
   * Parses CSV content into an array of records and caches them in IDB.
   * Pure function — no dependency on component state.
   */
  const parseAndCache = useCallback(async (handle: FileSystemFileHandle) => {
    const file = await handle.getFile()
    const content = await file.text()

    const lines = content.split("\n").filter((l) => l.trim())
    if (lines.length === 0) {
      setDataState([])
      await setLocalData("records", [])
      return
    }

    // Basic CSV Parser: Assumes first line is headers
    const headers = lines[0].split(",").map((h) => h.trim())
    const parsedData = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim())
      const obj: Record<string, unknown> = {}
      headers.forEach((h, i) => (obj[h] = values[i] || ""))
      return obj
    })

    // Update both memory and high-performance IDB cache
    setDataState(parsedData)
    await setLocalData("records", parsedData)
  }, [])

  /**
   * Public API: Synchronizes the in-memory state with the local CSV file.
   * Uses the current fileHandle from state. Safe to call from UI (refresh button).
   */
  const syncWithFile = useCallback(async () => {
    if (!fileHandle) return

    try {
      // Browsers often drop permissions on refresh. Check first.
      const status = await fileHandle.queryPermission({ mode: "readwrite" })
      if (status !== "granted") return

      await parseAndCache(fileHandle)
    } catch (err) {
      console.error("Sync with file failed:", err)
    }
  }, [fileHandle, parseAndCache])

  /**
   * Initialization logic (runs once on mount)
   * 1. Restore file handle from IDB.
   * 2. Check permission status.
   * 3. IF GRANTED: Fresh sync from file (Priority 1).
   * 4. IF NOT GRANTED: Fallback to the IDB cache (Priority 2).
   */
  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const handle = await getFileHandle()
        if (!handle || cancelled) return

        setFileHandleState(handle)
        const status = await handle.queryPermission({ mode: "readwrite" })
        const granted = status === "granted"
        setHasPermission(granted)

        if (granted) {
          await parseAndCache(handle)
        } else {
          const cachedData = await getLocalData<Record<string, unknown>>("records")
          if (!cancelled) setDataState(cachedData || [])
        }
      } catch (err) {
        console.error("Initialization failed:", err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    init()

    return () => {
      cancelled = true
    }
  }, [parseAndCache])

  /**
   * Opens the file picker and connects a new CSV.
   * Automatically persists the handle and triggers an initial sync.
   */
  const pickFile = useCallback(async () => {
    try {
      const [handle] = await window.showOpenFilePicker({
        types: [{ description: "CSV Data File", accept: { "text/csv": [".csv"] } }],
        multiple: false,
      })

      if (handle) {
        await setFileHandle(handle)
        setFileHandleState(handle)
        setHasPermission(true)
        await parseAndCache(handle)
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") console.error("Pick file failed:", err)
    }
  }, [parseAndCache])

  /**
   * Manually requests file system access.
   * Must be triggered by a direct user action (e.g., button click).
   */
  const requestAccess = useCallback(async () => {
    if (!fileHandle) return false
    const granted = await verifyPermission(fileHandle, true)
    setHasPermission(granted)
    if (granted) {
      await parseAndCache(fileHandle)
    }
    return granted
  }, [fileHandle, parseAndCache])

  /**
   * Resets the entire application state.
   */
  const clearHandle = useCallback(async () => {
    await clearStoredHandle()
    setFileHandleState(null)
    setHasPermission(false)
    setDataState([])
  }, [])

  /**
   * Updates global records and persists them to disk.
   * This is a React state update + IDB save + File Systen Write.
   *
   * @param newData The new list of records to save.
   */
  const setData = useCallback(
    async (newData: Record<string, unknown>[]) => {
      setDataState(newData)
      await setLocalData("records", newData)

      // Background sync to physical CSV if we have write access
      if (fileHandle && hasPermission) {
        try {
          const headers = Object.keys(
            newData[0] || {
              date: "",
              name: "",
              amount: "",
              category: "",
              category_limit: "",
              notes: "",
            }
          )

          // Simple CSV Serializer
          const csvContent = [
            headers.join(","),
            ...newData.map((row) =>
              headers
                .map((h) => {
                  const val = String(row[h] || "")
                  // Wrap in quotes if comma is present to prevent CSV corruption
                  return val.includes(",") ? `"${val}"` : val
                })
                .join(",")
            ),
          ].join("\n")

          const writable = await fileHandle.createWritable()
          await writable.write(csvContent)
          await writable.close()
        } catch (err) {
          console.error("Background sync failed:", err)
        }
      }
    },
    [fileHandle, hasPermission]
  )

  return (
    <FileHandleContext.Provider
      value={{
        fileHandle,
        hasPermission,
        isLoading,
        pickFile,
        requestAccess,
        clearHandle,
        data,
        setData,
        syncWithFile,
      }}
    >
      {children}
    </FileHandleContext.Provider>
  )
}

export function useFileHandle() {
  const context = useContext(FileHandleContext)
  if (context === undefined) {
    throw new Error("useFileHandle must be used within a FileHandleProvider")
  }
  return context
}
