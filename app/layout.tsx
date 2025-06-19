"use client"

import type React from "react"

import type { Metadata } from "next"
import "./globals.css"
import { useEffect } from "react"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 👉 self-healing chunk-load handler
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      // Webpack sets `error.name === "ChunkLoadError"`
      // Safari sometimes only gives a generic message – fall back to message match.
      const isChunkError =
        (event.error && event.error.name === "ChunkLoadError") || /(Loading chunk [\d]+ failed)/i.test(event.message)

      if (isChunkError) {
        // one best-effort reload; if it keeps failing we stop to avoid loops
        const hasRetried = sessionStorage.getItem("__chunk_retry__")
        if (hasRetried) return

        sessionStorage.setItem("__chunk_retry__", "1")
        location.reload()
      }
    }

    window.addEventListener("error", handler)
    return () => window.removeEventListener("error", handler)
  }, [])

  useEffect(() => {
    sessionStorage.removeItem("__chunk_retry__")
  }, [])

  /* ⭐️  existing JSX stays exactly as it was */
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
