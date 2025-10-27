import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Poppins, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
})
const _inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "QSL AI Hackathon 2025",
  description:
    "Join the QSL AI Hackathon - Build AI solutions, compete for prizes, and innovate with cutting-edge technology",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${_poppins.variable} ${_inter.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
