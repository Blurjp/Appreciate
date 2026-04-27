import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-serif',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Appreciate',
  description: 'Build your gratitude habit, share appreciation, and make the world a more grateful place.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSerifDisplay.variable} ${dmSans.variable}`}>
      <body className="font-sans bg-brand-background text-brand-text-primary">
        <Providers>
          <div className="max-w-3xl mx-auto bg-brand-background min-h-screen relative shadow-warm">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
