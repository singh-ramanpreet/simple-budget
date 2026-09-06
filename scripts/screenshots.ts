#!/usr/bin/env bun
/**
 * Regenerates the README screenshots headlessly, using Bun 1.4's built-in
 * browser (`Bun.WebView`) and image pipeline (`Bun.Image`).
 *
 * What it does:
 *   1. Builds the app and serves `dist/` from an in-process `Bun.serve`.
 *   2. Opens a headless Chrome at phone size, pins "today", the locale and the
 *      timezone, and seeds the same budget the original screenshots used: a
 *      `budget.csv` in the browser's Origin Private File System plus the
 *      IndexedDB entry the app uses to remember the connected file.
 *   3. Captures four screens per theme (home, home with the Copy Buckets
 *      dialog, charts, settings), stitches them side by side on a canvas and
 *      encodes the strip to WebP with `Bun.Image`.
 *
 * Usage:
 *   bun scripts/screenshots.ts                # doc/images/Screenshot_{1,2}.webp
 *   bun scripts/screenshots.ts --out ./tmp    # write somewhere else
 *   bun scripts/screenshots.ts --skip-build   # reuse the existing dist/
 *   bun scripts/screenshots.ts --chrome /path/to/chrome
 *
 * Requires Bun >= 1.4 and a Chrome/Chromium/Edge/Brave binary. It is
 * auto-detected in the usual locations; otherwise set BUN_CHROME_PATH or pass
 * --chrome. A headless-only build works too, for example:
 *   bunx @puppeteer/browsers install chrome-headless-shell@stable
 */
import path from "node:path"
import { parseArgs } from "node:util"
import { $ } from "bun"

/* ── Configuration ──────────────────────────────────────────────────────── */

const ROOT = path.resolve(import.meta.dir, "..")
const DIST = path.join(ROOT, "dist")

/** CSS viewport of a phone, captured at 2× so every panel is 864 × 1652 px */
const VIEWPORT = { width: 432, height: 826, deviceScaleFactor: 2 }

/** "Today" as seen by the page, so the captured month and chart never drift */
const TODAY = "2026-04-08T12:00:00"
const LOCALE = "en-GB"
const TIMEZONE = "UTC"

/** The budget behind the original screenshots: three buckets, three purchases on 8 April */
const BUDGET_CSV = [
  "date,name,amount,category,category_limit,notes",
  "2026-04-01,,0,☕ Grocery,300,",
  "2026-04-01,,0,🏠 House,500,",
  "2026-04-01,,0,🚗 Car,250,",
  // Same-day rows are listed newest-first, so Gas ends up at the top
  "2026-04-08,Coffee,5,☕ Grocery,0,Starbucks",
  "2026-04-08,Internet,50,🏠 House,0,Novus",
  "2026-04-08,Gas,60,🚗 Car,0,Chevron",
].join("\n")

const THEMES = [
  { file: "Screenshot_1.webp", theme: "system", colorScheme: "light" },
  { file: "Screenshot_2.webp", theme: "dark", colorScheme: "dark" },
] as const

/* ── CLI ────────────────────────────────────────────────────────────────── */

const { values: args } = parseArgs({
  options: {
    out: { type: "string", default: path.join(ROOT, "doc", "images") },
    "skip-build": { type: "boolean", default: false },
    chrome: { type: "string" },
  },
})

/* ── Static server for dist/ ────────────────────────────────────────────── */

/** Screenshots captured so far, served back to the page for stitching */
const shots = new Map<string, Blob>()

function serveDist() {
  const index = Bun.file(path.join(DIST, "index.html"))
  return Bun.serve({
    port: 0,
    async fetch(request) {
      const { pathname } = new URL(request.url)
      if (pathname === "/__blank") {
        return new Response("<!doctype html><title>blank</title>", { headers: { "content-type": "text/html" } })
      }
      const shot = shots.get(pathname)
      if (shot) return new Response(shot)

      const target = path.join(DIST, path.normalize(pathname))
      if (target.startsWith(DIST + path.sep) && path.extname(target)) {
        const file = Bun.file(target)
        if (await file.exists()) return new Response(file)
        return new Response("Not found", { status: 404 })
      }
      return new Response(index) // SPA fallback
    },
  })
}

/* ── Page helpers ───────────────────────────────────────────────────────── */

type View = InstanceType<typeof Bun.WebView>

/** Installed before each document loads: makes `new Date()` / `Date.now()` start from TODAY */
const CLOCK_SHIM = `(() => {
  const RealDate = Date
  const offset = new RealDate(${JSON.stringify(TODAY)}).getTime() - RealDate.now()
  class ShiftedDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) super(RealDate.now() + offset)
      else super(...args)
    }
    static now() {
      return RealDate.now() + offset
    }
  }
  globalThis.Date = ShiftedDate
})()`

/** Writes budget.csv into the Origin Private File System and registers it the way the app does */
function seedScript(theme: string) {
  return `(async () => {
    localStorage.clear()
    localStorage.setItem("simple-budget-theme", ${JSON.stringify(theme)})

    const root = await navigator.storage.getDirectory()
    const handle = await root.getFileHandle("budget.csv", { create: true })
    const writable = await handle.createWritable()
    await writable.write(${JSON.stringify(BUDGET_CSV)})
    await writable.close()

    await new Promise((resolve, reject) => {
      const request = indexedDB.open("simple-budget-db", 1)
      request.onupgradeneeded = () => {
        request.result.createObjectStore("settings")
        request.result.createObjectStore("data")
      }
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const tx = db.transaction(["settings", "data"], "readwrite")
        tx.objectStore("settings").put(handle, "file-handle")
        tx.objectStore("data").clear()
        tx.onerror = () => reject(tx.error)
        tx.oncomplete = () => {
          db.close()
          resolve()
        }
      }
    })

    return handle.queryPermission({ mode: "readwrite" })
  })()`
}

async function applyEmulation(view: View, colorScheme: "light" | "dark") {
  await view.cdp("Emulation.setDeviceMetricsOverride", { ...VIEWPORT, mobile: true })
  await view.cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: colorScheme }] })
  await view.cdp("Emulation.setLocaleOverride", { locale: LOCALE })
  await view.cdp("Emulation.setTimezoneOverride", { timezoneId: TIMEZONE })
  await view.cdp("Page.enable")
  await view.cdp("Page.addScriptToEvaluateOnNewDocument", { source: CLOCK_SHIM })
}

async function waitForText(view: View, text: string, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await view.evaluate<boolean>(`document.body.innerText.includes(${JSON.stringify(text)})`)) return
    await Bun.sleep(100)
  }
  throw new Error(`Timed out waiting for "${text}" on ${view.url}`)
}

/** Waits for web fonts and any enter animations before a capture */
async function settle(view: View, animationMs: number) {
  await view.evaluate("document.fonts.ready.then(() => true)")
  await Bun.sleep(animationMs)
}

/** Clicks the first button whose label matches, without scrolling it into view */
function clickButton(view: View, label: string) {
  return view.evaluate(
    `(() => {
      const button = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === ${JSON.stringify(label)})
      if (!button) throw new Error("No button labelled " + ${JSON.stringify(label)})
      button.click()
      return true
    })()`
  )
}

async function capture(view: View, name: string) {
  const blob = await view.screenshot({ format: "png" })
  const url = `/__shots/${name}.png`
  shots.set(url, blob)
  console.log(`  captured ${name} (${(blob.size / 1024).toFixed(0)} KB)`)
  return url
}

/** Draws the panels side by side on a canvas inside the page and returns the PNG bytes */
async function stitch(view: View, urls: Array<string>) {
  const dataUrl = await view.evaluate<string>(
    `(async () => {
      const images = await Promise.all(${JSON.stringify(urls)}.map((src) => new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = () => reject(new Error("Could not load " + src))
        image.src = src
      })))
      const width = images[0].naturalWidth
      const height = images[0].naturalHeight
      const canvas = document.createElement("canvas")
      canvas.width = width * images.length
      canvas.height = height
      const context = canvas.getContext("2d")
      images.forEach((image, i) => context.drawImage(image, i * width, 0))
      return canvas.toDataURL("image/png")
    })()`
  )
  return Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64")
}

/* ── Capture flow ───────────────────────────────────────────────────────── */

async function captureTheme(view: View, origin: string, { theme, colorScheme, file }: (typeof THEMES)[number]) {
  console.log(`${file}: theme=${theme}`)
  const prefix = theme

  // Same-origin blank page: sets up the CDP session and gives us storage to seed
  await view.navigate(`${origin}/__blank`)
  await applyEmulation(view, colorScheme)
  const permission = await view.evaluate<string>(seedScript(theme))
  if (permission !== "granted") {
    throw new Error(`Expected the seeded file handle to be granted, got "${permission}"`)
  }

  // 1. Home: April's transactions and buckets
  await view.navigate(`${origin}/`)
  await waitForText(view, "Buckets")
  await waitForText(view, "Chevron")
  await settle(view, 300)
  const home = await capture(view, `${prefix}-1-home`)

  // 2. Home: next month, with the Copy Buckets dialog open
  await view.click('[data-slot="card-content"] svg.cursor-pointer:last-of-type')
  await waitForText(view, "No transactions this month.")
  await clickButton(view, "Copy Buckets")
  await waitForText(view, "The following buckets will be added")
  await settle(view, 400)
  const copyBuckets = await capture(view, `${prefix}-2-copy-buckets`)

  // 3. Charts: total spent over the last six months
  await view.navigate(`${origin}/charts`)
  await waitForText(view, "Spending Trends")
  await settle(view, 1500) // Chart.js bar animation
  const charts = await capture(view, `${prefix}-3-charts`)

  // 4. Settings: theme switcher and the connected file
  await view.navigate(`${origin}/settings`)
  await waitForText(view, "Saving changes directly to")
  await settle(view, 800) // page fade-in
  const settings = await capture(view, `${prefix}-4-settings`)

  const png = await stitch(view, [home, copyBuckets, charts, settings])
  const output = path.join(args.out, file)
  const bytes = await new Bun.Image(png).webp({ quality: 90 }).write(output)
  console.log(`  wrote ${path.relative(ROOT, output)} (${(bytes / 1024).toFixed(0)} KB)`)
}

async function main() {
  if (!args["skip-build"]) {
    console.log("Building the app...")
    await $`bun --bun vite build`.cwd(ROOT).quiet()
  }
  if (!(await Bun.file(path.join(DIST, "index.html")).exists())) {
    throw new Error(`No build found in ${DIST}. Run without --skip-build.`)
  }

  const server = serveDist()
  const origin = `http://localhost:${server.port}`
  console.log(`Serving dist/ at ${origin}`)

  try {
    await using view = new Bun.WebView({
      width: VIEWPORT.width,
      height: VIEWPORT.height,
      backend: {
        type: "chrome",
        url: false,
        path: args.chrome ?? process.env.BUN_CHROME_PATH,
        argv: ["--hide-scrollbars", `--lang=${LOCALE}`],
      },
      console: (type, ...messages) => {
        if (type === "error") console.error("  [page]", ...messages)
      },
    })

    for (const entry of THEMES) {
      await captureTheme(view, origin, entry)
    }
  } finally {
    server.stop(true)
  }
}

await main()
