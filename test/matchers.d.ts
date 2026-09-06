/**
 * Teaches `bun:test`'s `expect` about the jest-dom matchers registered in ./setup.ts
 * (toBeInTheDocument, toHaveTextContent, toBeDisabled, ...).
 */
import type { expect } from "bun:test"
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers"

declare module "bun:test" {
  interface Matchers<T> extends TestingLibraryMatchers<ReturnType<typeof expect.stringContaining>, T> {}
  interface AsymmetricMatchers extends TestingLibraryMatchers<ReturnType<typeof expect.stringContaining>, void> {}
}
