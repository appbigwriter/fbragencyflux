import { readFile } from 'node:fs/promises'
import path from 'node:path'

const API_KEY = process.env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyM2M2NjRiMC1hNDJlLTQzM2MtODU4NS05YmMyZmEyZjUxNGYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNDBiZTE2NzQtNTNkZC00MzI3LWJiM2ItMWM4NjFkNDIzYTBhIiwiaWF0IjoxNzkwMjA2Mjk0fQ.C-guGLdqyOMComPtEdVpjorfzLn2Ewl7wEmCA2mDhIc'
const BASE_URL = (process.env.N8N_BASE_URL || 'https://n8n.fbr.news').replace(/\/+$/, '')

const headers = {
  'X-N8N-API-KEY': API_KEY,
  'Content-Type': 'application/json'
}

async function n8nRequest(endpoint, options = {}) {
  const url = `${BASE_URL}/api/v1${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) }
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`n8n API ${options.method || 'GET'} ${endpoint} failed (${response.status}): ${errorText}`)
  }
  return response.json()
}

async function main() {
  console.log(`[n8n Sync] Conectando ao n8n em ${BASE_URL}...`)

  // 1. Listar workflows existentes
  const list = await n8nRequest('/workflows')
  console.log(`[n8n Sync] Encontrados ${list.data.length} workflows existentes no n8n.`)

  // 2. Mapeamento de arquivos locais para nomes de workflows
  const workflowsDir = path.resolve(process.cwd(), '..', '05-workflows', 'n8n')
  const localFiles = [
    { file: '01_flux_to_hermes_dispatch.json', prefix: '01 - FBR Flux: Disparar Agente Hermes' },
    { file: '02_hermes_to_flux_handoff.json', prefix: '02 - FBR Flux: Retorno de Artefato' },
    { file: '03_gate_notification_sergio.json', prefix: '03 - FBR Flux: Notificação' },
    { file: '04_external_sync_pipeline.json', prefix: '04 - FBR Flux: Sincronização' },
    { file: '05_paper_boy_courier.json', prefix: '05 - FBR Flux: Paper Boy Courier' }
  ]

  for (const item of localFiles) {
    const filePath = path.join(workflowsDir, item.file)
    const content = JSON.parse(await readFile(filePath, 'utf8'))
    
    // Localizar se já existe no n8n (não arquivado)
    const existing = list.data.find(w => !w.isArchived && (w.name.includes(item.prefix) || w.name.startsWith(item.prefix.slice(0, 10))))

    if (existing) {
      console.log(`[n8n Sync] Atualizando workflow ID ${existing.id} (${existing.name})...`)
      const payload = {
        name: content.name,
        nodes: content.nodes,
        connections: content.connections,
        settings: { executionOrder: 'v1', ...(content.settings || {}) }
      }
      await n8nRequest(`/workflows/${existing.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })

      // Ativar se não estiver ativo
      if (!existing.active) {
        console.log(`[n8n Sync] Ativando workflow ${existing.id}...`)
        await n8nRequest(`/workflows/${existing.id}/activate`, { method: 'POST' })
      }
      console.log(`[n8n Sync] ✅ Workflow ${existing.id} atualizado e ativo.`)
    } else {
      console.log(`[n8n Sync] Criando novo workflow para ${content.name}...`)
      const created = await n8nRequest('/workflows', {
        method: 'POST',
        body: JSON.stringify({
          name: content.name,
          nodes: content.nodes,
          connections: content.connections,
          settings: { executionOrder: 'v1' }
        })
      })
      await n8nRequest(`/workflows/${created.id}/activate`, { method: 'POST' })
      console.log(`[n8n Sync] ✅ Workflow ${created.id} criado e ativado com sucesso.`)
    }
  }

  // 3. Deletar rascunhos inativos duplicados se existirem
  const drafts = list.data.filter(w => !w.active && w.name.includes('Disparar Agente Hermes por Card/Job') && w.id === 'jZXLqku5JN1Ce3aK')
  for (const d of drafts) {
    console.log(`[n8n Sync] Removendo rascunho duplicado inativo ${d.id}...`)
    try {
      await n8nRequest(`/workflows/${d.id}`, { method: 'DELETE' })
      console.log(`[n8n Sync] ✅ Rascunho ${d.id} removido.`)
    } catch (e) {
      console.warn(`[n8n Sync] Aviso ao remover ${d.id}:`, e.message)
    }
  }

  console.log('[n8n Sync] Todos os fluxos foram sincronizados, padronizados e ativados no n8n!')
}

main().catch((err) => {
  console.error('[n8n Sync Error]:', err)
  process.exit(1)
})
