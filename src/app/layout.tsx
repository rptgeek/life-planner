import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Life Planner — Plan Your Day. Achieve Your Goals. Live Your Mission.',
    template: '%s | Life Planner',
  },
  description: 'A Franklin-inspired personal planner that connects your mission and values to daily action. Set goals, plan your day, and track what matters most.',
  keywords: ['life planner', 'daily planner', 'goal setting', 'mission statement', 'Franklin planner', 'productivity', 'personal development'],
  authors: [{ name: 'Life Planner' }],
  creator: 'Life Planner',
  metadataBase: new URL('https://life-planner-rouge.vercel.app'),
  openGraph: {
    title: 'Life Planner — Plan with Purpose',
    description: 'Connect your mission and values to daily action. A Franklin-inspired planner for people who want to live intentionally.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Life Planner',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Life Planner — Plan with Purpose',
    description: 'Connect your mission and values to daily action.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Life Planner',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  )
}
