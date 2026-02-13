import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { TaskProvider } from "@/lib/task-context"
import { AppNav } from "@/components/app-nav"

import "./globals.css"

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const _jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

export const metadata: Metadata = {
  title: "Cycle Timer",
  description:
    "45-minute work / 15-minute break cycle timer for focused productivity",
}

export const viewport: Viewport = {
  themeColor: "#0a0e14",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body
        className={`${_inter.variable} ${_jetbrainsMono.variable} font-sans antialiased`}
      >
        <TaskProvider>
          {children}
          <AppNav />
        </TaskProvider>
      </body>
    </html>
  )
}
