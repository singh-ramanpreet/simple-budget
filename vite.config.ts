// vite.config.ts
import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { nitro } from "nitro/vite"

export default defineConfig({
  server: {
    port: 3000,
    allowedHosts: ["budget.homelab.singhramanpreet.com"],
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      srcDirectory: "src",
      prerender: {
        enabled: true,
      },
      router: {
        routesDirectory: "routes",
      },
    }),
    viteReact(),
    nitro(),
  ],
})
