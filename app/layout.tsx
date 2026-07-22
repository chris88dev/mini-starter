import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Mini Starter",
  description: "Een minimale Next.js + Tailwind boilerplate om snel live te gaan.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  )
}
