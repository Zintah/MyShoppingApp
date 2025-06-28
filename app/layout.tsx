import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My Shopping App',
  description: 'A modern shopping application built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">My Shopping App</h1>
                </div>
                <nav className="flex space-x-8">
                  <a href="/" className="text-gray-500 hover:text-gray-900">Home</a>
                  <a href="/products" className="text-gray-500 hover:text-gray-900">Products</a>
                  <a href="/cart" className="text-gray-500 hover:text-gray-900">Cart</a>
                </nav>
              </div>
            </div>
          </header>
          <main>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
} 