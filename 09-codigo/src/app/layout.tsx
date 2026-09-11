import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Agency Flux', description: 'FBR Agency operational dashboard' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>
}
