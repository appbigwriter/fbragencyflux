import React from 'react'
import { expect,it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import RootLayout from '../src/app/layout'
it('shows a single global brand and actual login form even during session lookup',()=>{
 const html=renderToStaticMarkup(<RootLayout><main>Dashboard</main></RootLayout>)
 expect(html.match(/<form/g)).toHaveLength(1)
 expect(html).toContain('aria-label="FBR Agency Flux — início"')
 expect(html).toContain('type="password"')
 expect(html).toContain('autoComplete="username"')
})
