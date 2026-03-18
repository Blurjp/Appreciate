import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'Appreciate',
  description: 'Build your gratitude habit, share appreciation, and make the world a more grateful place.',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-gray-50">
        <Providers>
          {/* Mobile Container */}
          <div className="max-w-3xl mx-auto bg-white min-h-screen relative shadow-xl">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
