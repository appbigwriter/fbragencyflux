# Limpeza do cache Chromium do Hermes — receipt

**Data:** 2026-09-17  
**Perfil:** `C:/Users/OEM/AppData/Roaming/Hermes`  
**Aplicação:** Hermes desktop Electron

## Ação executada

- Fechamento controlado da árvore `Hermes.exe`.
- Remoção dos diretórios Chromium `Cache`, `Code Cache`, `GPUCache`, `DawnGraphiteCache` e `DawnWebGPUCache`, incluindo as partições `hermes-embed` e `hermes-preview`.
- Reabertura do desktop Hermes.

## Verificação

- Processos `Hermes.exe`: ativos após o reinício.
- `C:/Users/OEM/AppData/Local/hermes/state.db`: preservado, 252989440 bytes.
- Sessões em `C:/Users/OEM/AppData/Local/hermes/sessions`: preservadas, 26 entradas.
- `Local Storage`, `Network`, cookies e configurações não foram removidos.
- Os diretórios de cache reapareceram com arquivos novos/gerados pelo Electron após a reabertura; isso é esperado e não indica falha da limpeza.
