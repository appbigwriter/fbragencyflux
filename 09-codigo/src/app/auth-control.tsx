'use client'

import { createContext, FormEvent, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import styles from './page.module.css'

export type AuthSession = { actor: string; scope: 'local' | 'published'; roles: string[] }
export const AUTH_REQUEST_EVENT = 'flux:auth:request'
export const AUTH_REQUIRED_MESSAGE = 'Entre para passar este problema'
type AuthContextValue = { session: AuthSession | null; loading: boolean; refresh: () => Promise<void> }
const AuthContext = createContext<AuthContextValue | null>(null)

async function readSession(): Promise<AuthSession | null> {
  const response = await fetch('/api/auth/session', { cache: 'no-store' })
  if (!response.ok) return null
  return response.json() as Promise<AuthSession>
}

export function requestAuth(reason = AUTH_REQUIRED_MESSAGE) {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(AUTH_REQUEST_EVENT, { detail: { reason } }))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)
  const refresh = async () => {
    setLoading(true)
    try { setSession(await readSession()) } catch { setSession(null) } finally { setLoading(false) }
  }
  useEffect(() => {
    let active = true
    readSession().then((next) => { if (active) setSession(next) }).catch(() => { if (active) setSession(null) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  return <AuthContext.Provider value={{ session, loading, refresh }}>{children}</AuthContext.Provider>
}

export function useAuthSession() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuthSession must be used inside AuthProvider')
  return value
}

export default function AuthControl() {
  const { session, loading, refresh } = useAuthSession()
  const [actor, setActor] = useState('')
  const [credential, setCredential] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const actorRef = useRef<HTMLInputElement>(null)
  const credentialRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const open = (event: Event) => {
      const reason = (event as CustomEvent<{ reason?: string }>).detail?.reason || 'Entre para continuar'
      setExpanded(true)
      setMessage(reason)
      window.setTimeout(() => actorRef.current?.focus(), 0)
    }
    window.addEventListener(AUTH_REQUEST_EVENT, open)
    return () => window.removeEventListener(AUTH_REQUEST_EVENT, open)
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!actor.trim() || !credential) { setMessage('Informe actor e credencial para entrar.'); return }
    setBusy(true); setMessage('')
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ actor: actor.trim(), secret: credential }) })
      const body = await response.json()
      if (!response.ok) { setMessage(body.message || 'Não foi possível entrar.'); credentialRef.current?.focus(); return }
      setCredential('')
      await refresh()
      setExpanded(false)
    } catch { setMessage('Não foi possível conectar ao serviço de autenticação.') } finally { setBusy(false) }
  }

  async function signOut() {
    setBusy(true); setMessage('')
    try { await fetch('/api/auth/session', { method: 'DELETE' }); await refresh() }
    catch { setMessage('Não foi possível encerrar a sessão.') } finally { setBusy(false) }
  }

  return <section className={styles.authControl} aria-label="Autenticação">
    {loading ? <span className={styles.authStatus}>Verificando sessão…</span> : session ? <div className={styles.authLoggedIn}><span className={styles.authStatus}><strong>{session.actor}</strong> · {session.roles.join(', ')}</span><button type="button" onClick={signOut} disabled={busy}>Sair</button></div> : <>
      <span className={styles.authStatus}><strong>Não autenticado</strong></span>
      {!expanded ? <button type="button" onClick={() => { setExpanded(true); setMessage(''); window.setTimeout(() => actorRef.current?.focus(), 0) }}>Entrar</button> : <form className={styles.authForm} onSubmit={submit}>
        <input ref={actorRef} name="actor" aria-label="actor" value={actor} onChange={(event) => setActor(event.target.value)} placeholder="actor" autoComplete="username" />
        <input ref={credentialRef} name="credential" aria-label="credential" type="password" value={credential} onChange={(event) => setCredential(event.target.value)} placeholder="credencial" autoComplete="current-password" />
        <button type="submit" disabled={busy}>Entrar</button>
      </form>}
    </>}
    {message && <small role="alert" className={styles.authMessage}>{message}</small>}
  </section>
}
