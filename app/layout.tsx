import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import dynamic from "next/dynamic"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "NutriVeda - Ayurvedic Diet Planning",
  description: "Professional Ayurvedic diet planning software for doctors and dietitians",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ChatWidget = dynamic(() => import("@/components/chat-widget"), { ssr: false })
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <body className="font-sans bg-background text-foreground botanical-pattern min-h-screen">
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}
