import { useRef, useState } from "react"

/**
 * Serialises async UI actions such as saving or deleting from a dialog.
 *
 * `run` executes the given action unless one is already in flight, in which
 * case the call is ignored. That makes a double-click on Save (or Enter
 * followed by a click) submit exactly once even though the file write takes a
 * moment. `isPending` is true while an action runs, so callers can disable
 * their controls and show progress.
 */
export function usePendingAction() {
  const [isPending, setIsPending] = useState(false)
  // A ref, not state: the second click can arrive before React re-renders
  const inFlight = useRef(false)

  const run = async (action: () => Promise<void>) => {
    if (inFlight.current) return
    inFlight.current = true
    setIsPending(true)
    try {
      await action()
    } finally {
      inFlight.current = false
      setIsPending(false)
    }
  }

  return { isPending, run }
}
