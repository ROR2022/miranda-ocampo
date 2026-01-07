import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Open_Sans } from "next/font/google"
import "./globals.css"
import { quinceMainData } from "@/components/sections/data/main-data"

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-script",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
})

const { event } = quinceMainData;

export const metadata: Metadata = {
  title: `${event.celebrant}`,
  description: `Video-Galeria.`,
  generator: "",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${openSans.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
