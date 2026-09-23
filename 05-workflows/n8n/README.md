# Workflows N8N: Glue Code do FBR Agency Flux

> 📖 **Consulte o Guia Canônico:** Para instruções detalhadas de implantação, arquitetura completa, diagramas e smoke tests, acesse o documento [**GUIA-OPERACIONAL-N8N-FBR-AGENCY.md**](file:///f:/Projetos/_FBR/FBR%20Agency%20Flux/05-workflows/n8n/GUIA-OPERACIONAL-N8N-FBR-AGENCY.md).

Esta pasta contém os templates JSON dos workflows do **N8N** para conectar o **FBR Agency Flux** com os **Agentes Hermes** e as **APIs Externas** (Authority Engine, Audience Builder, Sales Engine e Control Tower).


---

## 📦 Arquivos de Workflow Disponíveis

1. **`01_flux_to_hermes_dispatch.json`**
   - **Objetivo:** Ouve eventos de novos cards/briefings do Flux e dispara o Agente Hermes correto (Bia, Théo, Caio, etc.) com prompt e contexto.
   - **Trigger:** Webhook do Flux (`POST /webhook/flux-event-receiver`).

2. **`02_hermes_to_flux_handoff.json`**
   - **Objetivo:** Recebe a conclusão do agente Hermes e envia o artefato/evidência de volta para o Inbox do Flux (`POST /api/flux/inbox`).
   - **Trigger:** Webhook do Hermes (`POST /webhook/hermes-completion-callback`).

3. **`03_gate_notification_sergio.json`**
   - **Objetivo:** Notifica Sergio via Telegram quando um Gate (G0 a G4) exigir aprovação formal.
   - **Trigger:** Webhook de Gate (`POST /webhook/flux-gate-alert`).

4. **`04_external_sync_pipeline.json`**
   - **Objetivo:** Sincroniza e aciona endpoints do **Authority Engine** e **Control Tower** conforme a fase da esteira.
   - **Trigger:** Webhook de Esteira (`POST /webhook/flux-pipeline-sync`).

5. **`05_paper_boy_courier.json`**
   - **Objetivo:** Roteador leve de Handoffs ("Paper Boy"). Recebe a conclusão de tarefas dos agentes, normaliza os dados do contrato e entrega no Flux e no próximo agente no Hermes sem custo operacional.
   - **Trigger:** Webhook do Paper Boy (`POST /webhook/paper-boy-courier`).


---

## ⚙️ Variáveis de Ambiente no N8N

No painel do N8N ou no arquivo `.env` do N8N, configure:

```env
FLUX_API_BASE_URL=https://flux.fbr.news
HERMES_API_BASE_URL=https://hermes.fbr.news/api/agent/run
CONTROL_TOWER_BASE_URL=https://control-tower.fbr.news
TELEGRAM_BOT_TOKEN=seu_bot_token_aqui
TELEGRAM_CHAT_ID=seu_chat_id_aqui
```

---

## 🚀 Como Importar no N8N:

1. Acesse sua instância do N8N.
2. Clique em **Workflows** → **Add Workflow**.
3. No menu de três pontos (`...`) no canto superior direito, selecione **Import from File**.
4. Selecione o arquivo `.json` desejado desta pasta.
5. Ative o workflow (**Active** = `ON`).
