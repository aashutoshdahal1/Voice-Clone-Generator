import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Pocket TTS Studio',
  description:
    'Professional text-to-speech powered by Kyutai Pocket TTS. Generate natural-sounding audio in seconds.',
  keywords: ['text to speech', 'TTS', 'voice cloning', 'AI audio', 'Kyutai'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a1a' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast: 'glass',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
