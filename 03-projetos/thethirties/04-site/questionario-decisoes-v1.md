# Questionário objetivo — Finalização do site The Thirties v1.1

Este questionário contém 42 perguntas objetivas para transformar decisões editoriais, visuais e técnicas em execução.
Quando houver opções, escolha apenas uma, salvo indicação contrária.

## Bloco A — Escopo e decisões do Publisher

Q01. Escopo da V1:
[ ] A — Blog editorial público + artigos + vídeos + páginas institucionais
[ ] B — Blog + área editorial protegida
[ ] C — Blog + área editorial + newsletter/captura
[ ] D — Outro: ____________________

Q02. Rotas obrigatórias na V1 (marque todas):
[ ] `/`
[ ] `/articles/[slug]`
[ ] `/videos/[slug]`
[ ] `/topics/[slug]`
[ ] `/about`
[ ] `/disclaimer`
[ ] `/terms`
[ ] `/contact`
[ ] `/privacy`
[ ] `/search`
[ ] Outro: ____________________

Q03. Conteúdo inicial publicado no staging:
[ ] A — Somente TT-005
[ ] B — TT-005 + demais conteúdos já verificados
[ ] C — Nenhum; apenas shell técnico

Q04. Idioma da V1:
[ ] A — EN-US apenas
[ ] B — EN-US agora; estrutura preparada para PT-BR
[ ] C — Bilíngue desde a V1

Q05. Domínio canônico:
Resposta: ______________________________________________

Q06. Publisher/responsável que deve aparecer no site:
Resposta: ______________________________________________

Q07. E-mail público de contato:
Resposta: ______________________________________________

Q08. Avatar/identidade visual da Maia:
[ ] A — Ilustração editorial
[ ] B — Fotografia/avatar realista
[ ] C — Sem avatar na V1
[ ] D — Outro: ____________________

Q09. Newsletter na V1:
[ ] A — Não implementar captura; apenas CTA desativado/“coming soon”
[ ] B — Implementar captura agora
[ ] C — Implementar somente após fornecedor definido

Q10. Busca e filtros na V1:
[ ] A — Não; somente homepage e artigos
[ ] B — Categorias e tags
[ ] C — Categorias, tags e busca textual

## Bloco B — Identidade e UI

Q11. Direção visual final:
[ ] A — Aprovar tokens existentes em `03-design-ui/tokens.css`
[ ] B — Solicitar nova proposta visual
[ ] C — Aprovar com alterações abaixo
Alterações: _____________________________________________

Q12. Tipografia:
[ ] A — Manter Inter/system sans + Georgia para títulos
[ ] B — Escolher outra combinação
Combinação: _____________________________________________

Q13. Tema:
[ ] A — Claro apenas
[ ] B — Claro + escuro
[ ] C — Respeitar preferência do sistema

Q14. Componentes prioritários (marque até 7):
[ ] Header/navigation
[ ] Article card
[ ] Article body
[ ] Sources block
[ ] Affiliate disclosure
[ ] YMYL disclaimer
[ ] Video embed/player
[ ] Transcript/captions panel
[ ] Newsletter CTA
[ ] Search
[ ] Footer
[ ] Visual “What I’d do” callout
[ ] Reading-time/progress indicator

## Bloco C — Conteúdo, compliance e monetização

Q15. Formato de conteúdo técnico:
[ ] A — Markdown local na V1
[ ] B — MDX local na V1
[ ] C — Conteúdo vindo do Supabase desde o início

Q16. Sources em artigos:
[ ] A — Obrigatórias para todo claim factual
[ ] B — Obrigatórias apenas para saúde/YMYL
[ ] C — Outra regra: ______________________________________

Q17. Links de afiliados na V1:
[ ] A — Não inserir ainda
[ ] B — Inserir somente após aprovação individual do catálogo
[ ] C — Inserir com catálogo já validado

Q18. Produtos e catálogo:
[ ] A — Nenhum produto até nova decisão
[ ] B — Roupas/acessórios primeiro
[ ] C — Beleza/autocuidado primeiro
[ ] D — Suplementos somente após revisão YMYL
[ ] E — Outro: ____________________

Q19. Conteúdos liberados para staging:
[ ] A — TT-005 apenas
[ ] B — TT-005 + TT-007
[ ] C — TT-005 + TT-007 + TT-009
[ ] D — Outro: ____________________

## Bloco D — Supabase, autenticação e dados

Q20. Fonte canônica de conteúdo:
[ ] A — Supabase/Postgres desde a V1
[ ] B — Markdown local no staging; Supabase na etapa seguinte
[ ] C — Outro CMS: ____________________

Q21. Projeto Supabase:
[ ] A — Já existe e pode ser usado
[ ] B — Deve ser criado/provisionado
[ ] C — Ainda não autorizar provisionamento

Q22. Autenticação da área editorial:
[ ] A — Implementar agora
[ ] B — Preparar contratos, sem ativar
[ ] C — Não haverá área editorial na V1

Q23. Papéis necessários:
[ ] A — Apenas Publisher/Admin
[ ] B — Publisher + Editor
[ ] C — Publisher + Editor + Reviewer/QA
[ ] D — Outro: ____________________

Q24. Migrations remotas:
[ ] A — Autorizadas após revisão técnica
[ ] B — Preparar arquivos, não aplicar
[ ] C — Não autorizadas ainda

## Bloco E — SEO, acessibilidade e distribuição

Q25. SEO obrigatório na V1 (marque todos):
[ ] Metadata por página
[ ] Canonical
[ ] Open Graph
[ ] Twitter/X Cards
[ ] robots.txt
[ ] sitemap.xml
[ ] RSS
[ ] JSON-LD Article

Q26. Analytics:
[ ] A — Não instalar na V1
[ ] B — Preparar consentimento, sem provedor
[ ] C — Instalar provedor: ____________________

Q27. Acessibilidade mínima:
[ ] A — WCAG AA como objetivo
[ ] B — Auditoria básica de teclado/contraste/alt/captions
[ ] C — Outro: __________________________________________

## Bloco F — Staging e produção

Q28. Staging remoto:
[ ] A — Autorizado após build e testes locais
[ ] B — Preparar configuração, sem deploy
[ ] C — Não autorizado ainda

Q29. Plataforma de hospedagem:
[ ] A — Vercel
[ ] B — VPS/Easypanel
[ ] C — Outra: ___________________________________________
[ ] D — Ainda não definida

Q30. Deploy de produção:
[ ] A — Não autorizado
[ ] B — Preparar somente
[ ] C — Autorizado após staging aprovado

Q31. Monetização/publicação:
[ ] A — Manter bloqueada até Gate formal do Sergio
[ ] B — Publicar sem afiliados; monetização bloqueada
[ ] C — Outro: ___________________________________________

Q32. Critério para considerar o site “finalizado”:
[ ] A — Staging funcional e aprovado
[ ] B — Produção publicada e verificada
[ ] C — Código pronto, sem deploy
[ ] D — Outro: ___________________________________________

## Bloco G — Prioridade de execução

Q33. Próxima frente imediata (escolha uma):
[ ] A — Fechar decisões de escopo e dados (Q01–Q10)
[ ] B — Implementar rotas e conteúdo local
[ ] C — Implementar Supabase e migrations
[ ] D — Implementar SEO/acessibilidade
[ ] E — Preparar staging

Q34. Aceita execução em sequência sem nova aprovação entre tarefas locais?
[ ] SIM
[ ] NÃO

Q35. Limite de ação sem nova aprovação:
[ ] A — Somente arquivos locais e testes
[ ] B — Arquivos locais + dependências npm
[ ] C — Também ambiente de staging
[ ] D — Outro: ___________________________________________

## Bloco H — Alinhamento editorial, visual e de implementação

Q36. Formatos editoriais assinatura da V1 (marque todos):
[ ] You Asked / Dear Maia
[ ] How I’d Handle It
[ ] What I’d Do
[ ] Guide/Explainer
[ ] Review/Decision guide
[ ] Outro: ___________________________________________

Q37. Modelo de página de conteúdo:
[ ] A — Artigo e vídeo em páginas separadas
[ ] B — Artigo com vídeo incorporado
[ ] C — Artigo, vídeo, transcript e Sources na mesma página
[ ] D — Outro: ___________________________________________

Q38. Assets visuais:
[ ] A — Somente ilustrações/arte licenciada
[ ] B — Fotografia própria/licenciada
[ ] C — Imagens geradas por IA, sempre rotuladas
[ ] D — Combinação: _____________________________________

Q39. Wireframe antes da implementação visual:
[ ] A — Obrigatório para Home e Article
[ ] B — Obrigatório para todas as rotas públicas
[ ] C — Não necessário; implementar diretamente pelos tokens

Q40. Páginas legais obrigatórias além de Disclaimer:
[ ] Privacy
[ ] Terms
[ ] Affiliate disclosure
[ ] Cookie/consent notice
[ ] Contact
[ ] Outro: _____________________________________________

Q41. Observabilidade mínima da V1:
[ ] A — Logs de erro e health check
[ ] B — A + correlation ID e auditoria editorial
[ ] C — A + B + analytics consentido

Q42. Definição operacional de “código pronto”:
[ ] A — Rotas principais renderizam localmente
[ ] B — A + typecheck/lint/test/build verdes
[ ] C — B + staging verificável
[ ] D — C + produção publicada e readback externo

## Resumo de decisão

Publisher: ______________________________________________
Data: ____/____/________
Decisões adicionais: _____________________________________
_________________________________________________________

Ao receber as respostas, a execução será convertida em cards SITE-001 a SITE-022, mantendo os Gates de Supabase remoto, staging, produção, publicação e monetização conforme suas escolhas.
