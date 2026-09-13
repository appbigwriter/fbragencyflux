# DesignSystemBlogs

Estrutura compartilhada para os quatro blogs da FBR Agency

## Estrutura

```text
_base/Nocturne/       fonte base versionada por cópia verificável
  styles.css          tokens e camada de componentes
  _ds_manifest.json   manifesto do Design System Nocturne
  readme.md           guia original da base
  _ds_bundle.js       bundle original
  _adherence.oxlintrc.json
  support.js          suporte original preservado
  image-slot.js       helper original preservado
after-forty/          adaptação documentada de After Forty
blog-02/              placeholder até o nome ser informado
blog-03/              placeholder até o nome ser informado
blog-04/              placeholder até o nome ser informado
manifest-blogs.json   registro dos quatro blogs
```

## Regra de composição

`_base/Nocturne/` é a fonte compartilhada. Cada blog pode conter somente documentação, tokens de adaptação e componentes específicos necessários ao próprio projeto. Não duplicar a base nem editar seus arquivos para atender um blog. Adaptações devem apontar para `_base/Nocturne/` e registrar divergências aprovadas

Os arquivos originais continuam preservados no local anterior, em `_ds/nocturne-bd15c425-53b9-4883-b46d-6ecda90ef625/`, `support.js` e `image-slot.js`. A pasta `_base/Nocturne/` é um snapshot por cópia; hashes devem ser comparados antes de qualquer troca futura

## Estado dos blogs

- `after-forty/`: nome definido; persona Heidi Braun e referências existentes no material de identidade foram documentadas sem criar identidade visual adicional
- `blog-02/`: `NAME_PENDING`
- `blog-03/`: `NAME_PENDING`
- `blog-04/`: `NAME_PENDING`

Esta reorganização não autoriza publicação, deploy, gasto, alteração de infraestrutura ou commit
