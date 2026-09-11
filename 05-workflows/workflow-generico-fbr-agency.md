# Workflow genérico da FBR Agency

## Regra estrutural

Todo projeto nasce de um briefing, vira um plano no Kanban da Kora, recebe um responsável por etapa e só avança quando o critério de aceite do estado atual estiver atendido. O FBR Agency Flux é o contrato comum; cada projeto acrescenta suas particularidades

## Fluxo de ponta a ponta

```text
Sergio envia briefing
→ Íris valida e decompõe
→ Bia pesquisa contexto, mercado, público e referências
→ Kora cria project plan, cards, dependências e gates
→ Íris confirma ownership e cria os handoffs
→ Théo define arquitetura, integrações, banco e runtime
→ agentes especialistas executam suas frentes em paralelo
→ responsáveis devolvem artefatos e evidências
→ Gabe audita qualidade, segurança e aceite
→ Sergio aprova quando houver gate
→ Théo ou agente designado executa publicação/deploy
→ Kora lê o resultado de volta e encerra o card
```

## Interações por função

| Função | Recebe de | Entrega para | Interação principal |
|---|---|---|---|
| Sergio | resumo executivo e decisões pendentes | Íris/Kora | aprova, rejeita ou solicita ajustes no card específico |
| Íris | briefing e dados da Bia | Kora e todos os agentes | decompõe escopo, ordena dependências e coordena handoffs |
| Kora | plano da Íris | Sergio e agentes | cria cards, controla estados, bloqueios, prazos e evidências |
| Bia | briefing e fontes | Íris, Caio e Lia | entrega dados sobre nicho, público, concorrência, referências e contexto |
| Théo | requisitos e arquitetura | Kora, Control Tower e deploy | implementa sistema, banco, integrações, secrets e rollback |
| Caio | posicionamento e dados da Bia | Íris, Lia e publicação | cria copy, mensagens, páginas e critérios de comunicação |
| Lia | briefing visual e pesquisa da Bia | Íris, Caio, Théo e Gestor | define identidade visual, assets, layout e especificações |
| Vito | identidade, copy e calendário | Íris, Caio e Sergio | cria redes, peças audiovisuais e calendário social; não publica sem gate |
| Rick | nicho, público e regras Amazon | Gestor Editorial e Íris | pesquisa produtos e oportunidades de afiliados; registra fontes e compliance |
| Rafa | objetivo, público, oferta e assets | Íris, Caio e Sergio | propõe tráfego pago/orgânico, orçamento e métricas; não ativa campanha sem gate |
| Gabe | artefatos de todos | Kora e Sergio | audita SEO, segurança, qualidade, evidências e critérios de aceite |
| Gestor Editorial | briefing, handoffs e calendário | Caio, Rick, Gabe e Kora | pauta, redige, seleciona anúncios, gerencia comentários e envia drafts |

## Regras de interação

1. A comunicação operacional ocorre por card e handoff, não por instrução perdida em chat
2. Cada handoff declara entrada, feito, artefato, riscos, próximo responsável e evidência
3. Paralelização só ocorre entre tarefas sem dependências; Kora registra a justificativa
4. Bia alimenta decisões, mas não substitui validação de Sergio nem a execução dos especialistas
5. Rick registra fontes, data, preço, disponibilidade e regras de afiliado sem prometer conversão
6. Rafa separa hipótese de projeção e resultado medido; toda verba exige gate
7. Vito, Caio e Lia entregam drafts para revisão antes de publicação pública
8. Gabe pode bloquear tecnicamente, mas não aprova em nome de Sergio
9. Théo não aplica migration destrutiva, deploy ou alteração de secrets sem gate válido
10. O Gestor Editorial trabalha dentro do nicho e das regras do briefing, sem ampliar escopo sozinho
11. Todo agente devolve o card ao responsável anterior quando faltar entrada, acesso ou critério
12. Nenhum agent recebe secrets além do mínimo necessário ao seu runtime

## Gates

- `G0 — escopo`: briefing completo e objetivo definido
- `G1 — fundação`: arquitetura, schema, ownership e riscos revisados
- `G2 — produção`: artefatos prontos, QA executado e evidências anexadas
- `G3 — Sergio`: aprovação formal para publicar, gastar, fazer deploy ou alterar dados
- `G4 — verificação`: leitura de volta do estado externo e encerramento pela Kora

## Critério de encerramento

Um projeto só é encerrado quando os cards estão em estado terminal, os artefatos foram entregues, os gates foram registrados, o resultado externo foi verificado e o relatório distingue implementado, verificado, bloqueado e roadmap
