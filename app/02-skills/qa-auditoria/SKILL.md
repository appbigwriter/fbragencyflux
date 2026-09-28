---
name: qa-auditoria
description: Checklist e critérios de qualidade, validação de design, testes funcionais, segurança e critérios de aceite.
---

# Skill: QA & Auditoria de Qualidade

Esta skill garante que nenhum projeto seja entregue com bugs visuais, links quebrados ou problemas de performance.

## 🔍 Checklist de Aceite

### 1. Visual & UX
- [ ] O layout está impecável em mobile (390px), tablet (768px) e desktop (1440px)?
- [ ] Contrastes de texto atendem aos critérios de legibilidade?
- [ ] Hover states, botões e interações respondem com fluidez?

### 2. Código & Funcionalidade
- [ ] O build de produção executa sem erros (`npm run build`)?
- [ ] Não há erros no console do navegador?
- [ ] Todos os formulários, links e CTAs funcionam corretamente?

### 3. SEO & Segurança
- [ ] Meta tags e Open Graph configurados?
- [ ] Nenhum secret ou chave privada exposta no frontend?
- [ ] Imagens otimizadas em WebP / AVIF com `alt` text apropriado?
