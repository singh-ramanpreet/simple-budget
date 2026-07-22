import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"
import { getRouter } from "./router"
import "./globals.css"

const router = getRouter()

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

// Register Service worker for offline support
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .then((registration) => {
      console.log("SW registered: ", registration)
    })
    .catch((registrationError) => {
      console.log("SW registration failed: ", registrationError)
    })
}

const rootElement = document.getElementById("root")!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
}
