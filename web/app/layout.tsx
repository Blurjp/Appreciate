import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import BottomNav from '@/components/layout/BottomNav'

export const metadata: Metadata = {
  title: 'Appreciate — Gratitude & Appreciation Platform',
  description:
    'Build your gratitude habit, share appreciation, and make the world a more grateful place.',
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
            {/* Main Content */}
            <main className="pb-16">
              {children}
            </main>
            
            {/* Bottom Navigation */}
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  )
}
