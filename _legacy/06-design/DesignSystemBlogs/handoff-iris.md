# Handoff — Design System base dos blogs para Íris

## Origem

Sergio Castro

## Destino

Íris — intake, concepção e orquestração

## Escopo

O diretório abaixo contém o Design System base compartilhado dos quatro blogs planejados pela FBR Agency, incluindo o After Forty:

```text
F:/Projetos/_FBR/FBR Agency Flux/06-design/DesignSystemBlogs
```

## Decisão

Íris deve considerar este Design System durante a concepção, arquitetura visual e definição dos workflows de cada blog. Ele é uma base comum, não uma identidade final automática

Cada blog deverá receber uma camada de adaptação própria para:

- persona
- nicho
- público
- posicionamento
- tom editorial
- paleta complementar, quando aprovada
- imagens
- componentes específicos
- necessidades de acessibilidade
- requisitos de monetização e conteúdo

## Conteúdo verificado

O sistema contém:

- tokens visuais
- stylesheet base
- tipografia
- cores e rampas
- espaçamento
- raios
- sombras
- estados interativos
- botões
- tags
- formulários
- cards
- navegação
- tabelas
- diálogos
- tratamento de imagens
- templates de landing
- páginas de foundations e componentes
- manifesto `_ds_manifest.json`

A base visual identificada no guia é o sistema `Nocturne`, com interface escura, baixa saturação, Inter, acento controlado, layouts assimétricos e componentes reutilizáveis

## Regras para Íris

- usar o Design System como referência antes de propor uma identidade paralela
- não copiar o sistema inteiro sem avaliar o projeto consumidor
- não alterar os arquivos-base para atender um único blog
- solicitar ou registrar extensão quando faltar componente
- manter tokens, documentação e implementação sincronizados
- preservar acessibilidade, foco de teclado e estados interativos
- registrar qualquer divergência como decisão de design
- encaminhar implementação ao owner técnico correto

## Relação com After Forty

O After Forty deve considerar o Design System como base, mas a adaptação precisa respeitar:

- Heidi Braun como persona fictícia
- público 40+
- categorias Skin & Beauty, Recovery & Wellness e Home Fitness
- idioma inglês
- mercado EUA/global
- publisher FBR News
- domínio `afterforty.fbr.news`
- disclaimer oficial obrigatório

Nenhuma mudança visual autoriza publicação, deploy, gasto ou alteração de infraestrutura

## Handoff padrão

```yaml
de: "Sergio Castro"
para: "Íris"
card: "FBR-FLUX-DESIGN-SYSTEM"
objetivo_do_job: "Usar DesignSystemBlogs como base visual compartilhada na concepção dos quatro blogs"
entregavel: "F:/Projetos/_FBR/FBR Agency Flux/06-design/DesignSystemBlogs"
decisoes_suposições:
  - "FATO: o diretório contém manifesto, tokens, stylesheet, componentes, foundations e templates"
  - "DECISÃO: a base será compartilhada entre os quatro blogs"
  - "DECISÃO: cada blog receberá adaptação própria sem alterar a fonte-base para atender um único projeto"
  - "FATO: After Forty está incluído no conjunto de blogs"
pendencias_blockers:
  - "Íris — incorporar a referência no intake e na concepção dos quatro blogs"
  - "Gestor Editorial — validar coerência visual com cada persona e público"
  - "Théo — implementar adaptações sem alterar o Design System-base"
  - "Sergio — aprovar identidade final de cada blog quando houver variação relevante"
gate: "concepção visual — referência aprovada; sem autorização de publicação ou deploy"
criterios_de_aceite_evidencia:
  - "Íris localiza o diretório e o manifesto do Design System"
  - "A base é registrada como referência compartilhada"
  - "Adaptações por blog são separadas da fonte-base"
  - "Nenhuma alteração externa é inferida deste Handoff"
```
