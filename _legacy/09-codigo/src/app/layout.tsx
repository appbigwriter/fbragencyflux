import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { AuthProvider, default as AuthControl } from './auth-control'
import FluxDoctorDrawer from './flux-doctor/flux-doctor-drawer'

export const metadata: Metadata = {
  title: 'FBR Agency Flux — Orquestrador & Governança',
  description: 'FBR Agency operational dashboard and governance'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <div className="appHeader">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <a className="brand" href="/" aria-label="FBR Agency Flux — início">
                <span className="brandMark" aria-hidden="true">FBR</span>
                <span>Agency<br /><strong>Flux</strong></span>
              </a>
              <nav style={{ display: 'flex', gap: '12px', fontSize: '0.9rem' }}>
                <Link href="/" style={{ textDecoration: 'none', color: 'var(--muted)' }}>Dashboard</Link>
                <Link href="/manual" style={{ textDecoration: 'none', color: '#5b8cff', fontWeight: 600 }}>📖 Manual & Helpdesk</Link>
              </nav>
            </div>
            <AuthControl />
          </div>
          {children}
          <FluxDoctorDrawer />
        </AuthProvider>
      </body>
    </html>
  )
}
