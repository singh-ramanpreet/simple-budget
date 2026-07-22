import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  {
    ignores: ["node_modules/**", "dist/**", ".output/**", ".tanstack/**"],
  },
  ...tanstackConfig,
]
