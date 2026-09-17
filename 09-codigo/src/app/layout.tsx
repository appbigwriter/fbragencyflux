import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider, default as AuthControl } from './auth-control'

export const metadata: Metadata = { title: 'Agency Flux', description: 'FBR Agency operational dashboard' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><AuthProvider><div className="appHeader"><a className="brand" href="/" aria-label="FBR Agency Flux — início"><span className="brandMark" aria-hidden="true">FBR</span><span>Agency<br/><strong>Flux</strong></span></a><AuthControl /></div>{children}</AuthProvider></body></html>
}
