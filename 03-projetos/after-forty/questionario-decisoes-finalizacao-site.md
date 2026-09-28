# Questionário de Decisões — Finalização do After Forty

**Projeto:** After Forty by Heidi Braun  
**Publisher:** Sergio Castro / FBR Agency  
**Domínio previsto:** `afterforty.fbr.news`

Responda usando o formato `1A, 2B, 3C...`. Quando escolher `Outro`, escreva a opção na mesma linha.

---

## A. Conteúdo e publicação

### 1. Fonte principal dos artigos
Qual deve ser a fonte de conteúdo para produção contínua?

- [ ] **A — MDX/Markdown local:** simples, versionado e sem custo de CMS.
- [x] **B — Supabase/Postgres:** conteúdo persistido em banco, com possibilidade de painel próprio.
- [ ] **C — Headless CMS:** Sanity, Contentful ou similar.
- [ ] **D — Outro:** ____________________

### 2. Migração dos 12 artigos existentes
- [x] **A — Migrar todos para a fonte escolhida antes do deploy.**
- [ ] **B — Manter os arquivos atuais e migrar gradualmente.**
- [ ] **C — Migrar somente os artigos publicados na primeira versão.**

### 3. Publicação editorial
- [ ] **A — Todo artigo precisa de aprovação manual do Sergio antes de publicar.**
- [x] **B — Heidi pode publicar conteúdo que passe pelo checklist editorial; Sergio aprova apenas conteúdo comercial/sensível.**
- [ ] **C — Outro fluxo:** ____________________

### 4. Conteúdo inicial no site
- [x] **A — Publicar os 12 artigos já produzidos.**
- [ ] **B — Publicar primeiro um lote menor e manter o restante como rascunho.**
- [ ] **C — Não publicar até revisão editorial completa.**

---

## B. Funcionalidades do blog

### 5. Busca de artigos
- [ ] **A — Implementar agora.**
- [x] **B — Deixar para a segunda versão.**
- [ ] **C — Não implementar.**

### 6. Categorias e tags
- [x] **A — Categorias fixas + tags por artigo.**
- [ ] **B — Apenas categorias fixas.**
- [ ] **C — Apenas tags.**
- [ ] **D — Outro:** ____________________

### 7. Metadados editoriais
Quais itens devem aparecer nos artigos? Marque todos os necessários.

- [x] **A — Data de publicação**
- [x] **B — Data de atualização**
- [x] **C — Tempo estimado de leitura**
- [x] **D — Autor/persona Heidi Braun**
- [x] **E — Fontes e referências**
- [x] **F — Tags**
- [ ] **G — Todos os itens acima**

### 8. Recursos de leitura
- [x] **A — Compartilhamento social agora.**
- [x] **B — Artigos relacionados agora.**
- [x] **C — Ambos agora.**
- [ ] **D — Deixar ambos para a segunda versão.**

---

## C. Newsletter e dados

### 9. Provedor de newsletter
- [ ] **A — Resend**
- [ ] **B — Beehiiv**
- [ ] **C — ConvertKit/Kit**
- [ ] **D — Mailchimp**
- [x] **E — Ainda não escolher; manter formulário desativado até decisão.**
- [ ] **F — Outro:** ____________________

### 10. Consentimento do formulário
- [ ] **A — Double opt-in obrigatório.**
- [ ] **B — Opt-in simples com confirmação visual.**
- [x] **C — Não ativar captação até a configuração jurídica/provedor.**

### 11. Banco de dados
- [x] **A — Usar Supabase remoto como fonte única de estado.**
- [ ] **B — Não usar banco nesta fase; manter conteúdo local.**
- [ ] **C — Outro:** ____________________

### 12. Dados que podem ser armazenados
- [ ] **A — Somente e-mail e data de inscrição.**
- [x] **B — E-mail, nome opcional e data de inscrição.**
- [ ] **C — Outro:** ____________________

---

## D. Infraestrutura e deploy

### 13. Plataforma de deploy
- [x] **A — VPS/Easypanel da FBR.**
- [ ] **B — Vercel.**
- [ ] **C — Outro provedor:** ____________________
- [ ] **D — Ainda não definido.**

### 14. Domínio
- [x] **A — Publicar em `afterforty.fbr.news`.**
- [ ] **B — Publicar temporariamente em subdomínio do provedor.**
- [ ] **C — Outro domínio:** ____________________

### 15. DNS e SSL
- [x] **A — Configuração feita pela equipe FBR/infraestrutura.**
- [ ] **B — Configuração feita pelo Sergio.**
- [ ] **C — Fazer somente depois da aprovação final do conteúdo.**

### 16. Ambiente de produção
- [x] **A — Produção separada do preview, com variáveis secretas no gerenciador do provedor.**
- [ ] **B — Deploy direto do mesmo ambiente validado localmente.**
- [ ] **C — Outro:** ____________________

---

## E. Monetização e compliance

### 17. Afiliados na primeira publicação
- [ ] **A — Ativar Amazon Associates e links afiliados desde o lançamento.**
- [ ] **B — Publicar primeiro sem links afiliados; ativar após revisão.**
- [x] **C — Ativar apenas quando houver produtos e links validados.**

### 18. FBR Ads
- [ ] **A — Integrar no lançamento.**
- [ ] **B — Preparar componentes, mas não exibir anúncios ainda.**
- [x] **C — Deixar para segunda versão.**

### 19. Analytics
- [ ] **A — Plausible/analytics privacy-first.**
- [ ] **B — Google Analytics 4 com consentimento.**
- [x] **C — Não instalar analytics inicialmente.**
- [ ] **D — Outro:** ____________________

### 20. Revisão jurídica
- [ ] **A — Publicar com as páginas institucionais atuais e revisar depois.**
- [x] **B — Revisar Privacy, Affiliate Disclosure e Contact antes do deploy.**
- [ ] **C — Bloquear deploy até revisão jurídica formal.**

---

## F. Escopo da primeira versão

### 21. O que significa “finalizar o site” para o próximo gate?
- [ ] **A — Site editorial estático funcional, com os 12 artigos e newsletter preparada.**
- [ ] **B — Blog completo com busca, filtros, metadados, compartilhamento e artigos relacionados.**
- [ ] **C — Blog completo + CMS/banco + newsletter funcionando + analytics + monetização ativa.**
- [x] **D — Outro escopo:** Blog completo + CMS/banco 

### 22. Prioridade após este questionário
Escolha apenas uma prioridade inicial.

- [x] **A — Migrar e estruturar os 12 artigos.**
- [ ] **B — Implementar busca, filtros e metadados.**
- [ ] **C — Conectar newsletter.**
- [x] **D — Conectar Supabase/CMS.**
- [x] **E — Preparar deploy e domínio.**
- [ ] **F — Outro:** ____________________

---

## Resposta rápida

Copie e preencha:

```text
1__ 2__ 3__ 4__ 5__ 6__ 7__ 8__
9__ 10__ 11__ 12__ 13__ 14__ 15__ 16__
17__ 18__ 19__ 20__ 21__ 22__

Observações:
- __________________________________________
- __________________________________________
- __________________________________________
```

**Nota operacional:** produção pública, alteração de DNS, ativação de gastos, publicação comercial e uso de credenciais continuam sujeitos ao gate do Sergio. Não inclua senhas, tokens ou chaves neste questionário.
