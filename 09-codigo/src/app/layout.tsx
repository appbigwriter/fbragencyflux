import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider, default as AuthControl } from './auth-control'

export const metadata: Metadata = { title: 'Agency Flux', description: 'FBR Agency operational dashboard' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><AuthProvider><div className="appHeader"><span>FBR Agency Flux</span><AuthControl /></div>{children}</AuthProvider></body></html>
}
