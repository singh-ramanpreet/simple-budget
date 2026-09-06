/**
 * Shared test preload (see bunfig.toml). Runs after ./happy-dom.ts has
 * registered the DOM globals.
 *
 *  - registers the jest-dom matchers on bun:test's `expect`
 *  - swaps the IndexedDB-backed storage module for an in-memory fake
 *  - polyfills the few browser APIs happy-dom lacks that Base UI touches
 *  - unmounts React trees and resets browser state after every test
 */
import { afterEach, expect, mock } from "bun:test"
import * as matchers from "@testing-library/jest-dom/matchers"
import { cleanup } from "@testing-library/react"
import { fakeStorage } from "./fake-file-system"

expect.extend(matchers)

mock.module("../src/lib/file-storage", () => fakeStorage.module)

if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver
}

if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = () => {}
}

/**
 * happy-dom (as of 20.x) checks `step` with a plain floating-point modulo, so
 * "600" in an <input type="number" step="0.01"> counts as a step mismatch
 * (600 % 0.01 !== 0) and clicking a submit button silently does nothing.
 * Browsers compare in decimal, so replace the getter with a decimal-safe check.
 */
const decimalsIn = (text: string) => /\.(\d+)$/.exec(text)?.[1].length ?? 0
const validityPrototype = Object.getPrototypeOf(document.createElement("input").validity)
Object.defineProperty(validityPrototype, "stepMismatch", {
  configurable: true,
  get(this: { element: Element }) {
    const el = this.element
    if (!(el instanceof HTMLInputElement) || (el.type !== "number" && el.type !== "range")) return false
    const stepAttr = el.getAttribute("step")
    if (stepAttr === "any" || el.value === "") return false
    const step = stepAttr === null ? 1 : Number(stepAttr)
    const value = Number(el.value)
    if (!Number.isFinite(value) || !(step > 0)) return false
    const scale = 10 ** Math.max(decimalsIn(stepAttr ?? "1"), decimalsIn(el.value))
    return Math.round(value * scale) % Math.round(step * scale) !== 0
  },
})

/**
 * The app nests `<Button>` inside `<DialogTrigger>` (itself a <button>), so React
 * logs a DOM-nesting warning every time a dialog trigger mounts. Silence just that
 * message so real errors stay visible.
 */
const NESTED_BUTTON_WARNING = /cannot be a descendant of|cannot contain a nested|ancestor stack trace/
const originalConsoleError = console.error
console.error = (...args: Array<unknown>) => {
  const message = args.find((a) => typeof a === "string")
  if (
    typeof message === "string" &&
    NESTED_BUTTON_WARNING.test(message) &&
    args.some((a) => typeof a === "string" && a.includes("button"))
  ) {
    return
  }
  originalConsoleError(...args)
}

afterEach(() => {
  cleanup()
  fakeStorage.reset()
  localStorage.clear()
  document.documentElement.className = ""
})
