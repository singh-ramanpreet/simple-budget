import { describe, expect, mock, test } from "bun:test"
import { act, renderHook } from "@testing-library/react"
import { usePendingAction } from "./use-pending-action"

/** An action that stays pending until the test resolves it */
function deferredAction() {
  let resolve!: () => void
  let reject!: (error: Error) => void
  const action = mock(
    () =>
      new Promise<void>((res, rej) => {
        resolve = res
        reject = rej
      })
  )
  return { action, resolve: () => resolve(), reject: (error: Error) => reject(error) }
}

describe("usePendingAction", () => {
  test("ignores a second call while the first action is still running", async () => {
    const { result } = renderHook(() => usePendingAction())
    const { action, resolve } = deferredAction()

    let first!: Promise<void>
    act(() => {
      first = result.current.run(action)
      void result.current.run(action)
    })

    expect(action).toHaveBeenCalledTimes(1)
    expect(result.current.isPending).toBe(true)

    await act(async () => {
      resolve()
      await first
    })
    expect(result.current.isPending).toBe(false)
  })

  test("accepts a new action once the previous one has finished", async () => {
    const { result } = renderHook(() => usePendingAction())
    const second = mock(() => Promise.resolve())

    await act(() => result.current.run(() => Promise.resolve()))
    await act(() => result.current.run(second))

    expect(second).toHaveBeenCalledTimes(1)
    expect(result.current.isPending).toBe(false)
  })

  test("clears the pending state when the action fails", async () => {
    const { result } = renderHook(() => usePendingAction())
    const { action, reject } = deferredAction()

    let first!: Promise<void>
    act(() => {
      first = result.current.run(action)
    })
    expect(result.current.isPending).toBe(true)

    await act(async () => {
      reject(new Error("disk full"))
      await expect(first).rejects.toThrow("disk full")
    })
    expect(result.current.isPending).toBe(false)

    const retry = mock(() => Promise.resolve())
    await act(() => result.current.run(retry))
    expect(retry).toHaveBeenCalledTimes(1)
  })
})
