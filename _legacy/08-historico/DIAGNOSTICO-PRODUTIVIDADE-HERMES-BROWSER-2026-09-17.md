# Diagnóstico de produtividade — Hermes / browser

**Data:** 2026-09-17  
**Tarefa:** SYS-001  

## Fatos verificados

- Logs do Hermes registram chamadas ao provider `openai-codex` com contexto aproximado de `~291.171 tokens`.
- As chamadas recentes registraram latência de aproximadamente `8,4s` e `8,9s`.
- O cache do prefixo estava alto (`99%`/`100%`), portanto o custo não é ausência de cache, mas o volume extremo do contexto processado e reenviado.
- A sessão browser nomeada consultada pelo agente estava em `about:blank`; não havia página carregada para inspeção nessa sessão.
- Não havia processos `node.exe`, Chrome, Edge ou Electron identificados pelo `tasklist` no momento da checagem.
- O log do gateway registra erro Slack separado: `invalid_auth`, com tentativa de reconexão a cada 300s.

## Diagnóstico

A queda percebida de produtividade é compatível principalmente com:

1. **Contexto excessivamente grande:** a sessão acumulou histórico, compactações e artefatos suficientes para chegar a aproximadamente 291k tokens. Mesmo com cache alto, isso aumenta latência, custo de raciocínio e risco de perda de foco.
2. **Browser desacoplado:** o browser nomeado usado na checagem não continha a página que o usuário esperava, portanto inspeções podem atingir uma sessão vazia diferente da janela visível.
3. **Ruído de integração:** Slack com credencial inválida gera reconexões periódicas e erros no log, embora não seja a causa principal da lentidão desta conversa.

## Ações recomendadas

- iniciar uma nova sessão Hermes para tarefas longas, reduzindo o contexto acumulado;
- usar um único browser session name por tarefa e confirmar `page_info()` após cada navegação;
- não manter fan-outs/background workers desnecessários quando o objetivo mudou;
- corrigir ou desabilitar com Gate a integração Slack inválida para eliminar retries;
- manter o `PENDING_TASKLIST.md` e os relatórios como handoff, em vez de carregar todo o histórico na mesma sessão.

## Estado

**Causa de produtividade identificada com evidência parcial/forte:** contexto excessivo e browser session vazio/desacoplado.  
**Causa não identificada:** falha do modelo/LLM. Os logs mostram chamadas normais ao provider, com latência alta compatível com o tamanho do contexto.
