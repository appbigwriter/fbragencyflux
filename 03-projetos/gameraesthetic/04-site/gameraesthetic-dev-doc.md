# Documentação para Dev — Gamer Aesthetic

## Identidade do projeto

- **Project ID:** `078193b2-20ed-4ca3-aa52-ba047846edb9`
- **Nome:** `Gamer Aesthetic`
- **Slug:** `gameraesthetic`
- **Tipo:** `blog`
- **Template:** `blog_standard` (v1.0.0)
- **Schema exclusivo:** `blog_gameraesthetic`
- **Domínio oficial:** `gameraesthetic.fbr.news`
- **Domínio de validação:** `https://gameraesthetic.fbr.news/health`
- **Namespace:** `fbr/blogs/078193b2-20ed-4ca3-aa52-ba047846edb9`
- **Target:** `vps2`
- **Repository path:** `/09-codigo`
- **Easypanel project:** `blogs`
- **Easypanel service:** `gamer`

## Runtime

As variáveis estão provisionadas no `.env.local` do site e não devem ser copiadas para Git, chat ou logs. O runtime esperado é produção, `HOST=0.0.0.0`, `PORT=3000`, schema `blog_gameraesthetic` e namespace do projeto acima.

## Regras

- Operar exclusivamente no schema `blog_gameraesthetic`.
- Não alterar tabelas de governança no schema `public`.
- Nunca enviar service role key ou tokens para o browser.
- Persistir ownership com `project_id` e `owner_id`.
- Validar `/health`, preflight relacional, escrita/readback e persistência após restart.
- Não declarar deploy concluído sem readback externo em `https://gameraesthetic.fbr.news/health`.
