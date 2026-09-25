# Talk to Your Crowd — Rick affiliate-link table v0.3

**Artefato:** `rick-affiliate-link-table-v0.3.md`  
**Responsável:** Rick  
**Projeto:** Talk to Your Crowd by Marcus Cole / FBR News  
**Artigo:** TTC-P1 — “7 Costly Storefront Mistakes Making Customers Walk Right Past You (And How to Fix Them on a Budget)”  
**Mercado:** Amazon.com / US  
**Fonte principal:** `bia-amazon-products-v0.2.md`  
**Data/hora da observação:** 2026-09-25 08:31:56 ESAST (UTC−03:00)  
**Versão anterior preservada:** `rick-affiliate-link-table-v0.2.md` não foi editada.  
**Gate:** esta tabela não substitui a QA independente do Gabe; o artigo não foi editado nem publicado.

## Critério de classificação

Um candidato é `VERIFIED` quando a evidência da mesma consulta confirma: ASIN e URL Amazon.com coincidentes, produto/variante identificáveis, disponibilidade observada, preço observado quando exibido, rating observado quando exibido e timestamp. A ausência de rating na página não é preenchida por inferência: fica registrada como limitação. `BLOCKED` indica divergência, indisponibilidade ou lacuna impeditiva.

`VERIFIED` significa verificado para identidade e estado observado do listing no momento da consulta; não significa garantia de preço, estoque, desempenho comercial ou adequação editorial final.

> **Regra de segurança:** todas as URLs abaixo são URLs públicas Amazon.com sem parâmetros de afiliado. Não há tag privada, token, segredo, credencial ou URL afiliada real neste artefato.

## Tabela Rick — TTC-P1

| article_id | candidato / variante observada | ASIN | URL Amazon.com sem parâmetros | disponibilidade | preço observado | rating observado | data/hora | status | pode substituir ASIN antigo? |
|---|---|---|---|---|---:|---:|---|---|---|
| TTC-P1 | T-SIGN Outdoor A-Frame Sidewalk Sign — 24 x 36 in; Black - Corrugated Plastic Boards; aço; portrait; duas placas incluídas | `B0718YQBXS` | `https://www.amazon.com/dp/B0718YQBXS` | In Stock | US$99.98 | 4.7/5 (519) | 2026-09-25 08:31:56 ESAST | **VERIFIED** | **Sim, como substituto de formato para `B08K1RZWCF`, `B08HYJ14RD` ou `B01HDDD0RQ`, sujeito à escolha editorial; não é equivalência exata de material, tamanho ou acabamento. |
| TTC-P1 | T-SIGN Outdoor A-Frame Sidewalk Sign — 22 x 28 in; Black - Coated Steel; metal; landscape; duas placas incluídas | `B076RNS74J` | `https://www.amazon.com/dp/B076RNS74J` | In Stock | US$74.98 | 4.6/5 (273) | 2026-09-25 08:31:56 ESAST | **VERIFIED** | **Sim, como substituto de formato para `B08K1RZWCF`, `B08HYJ14RD` ou `B01HDDD0RQ`, sujeito à escolha editorial; é menor que o 24 x 36 e não reproduz necessariamente a mesma apresentação. |
| TTC-P1 | INNOVART Chalk Board Easel Sign — 18 x 35 in; Easel - Black; metal; double-sided; com giz e acessórios | `B0F6YJVXQ3` | `https://www.amazon.com/dp/B0F6YJVXQ3` | In Stock | US$109.99 | 3.9/5 (41) | 2026-09-25 08:31:56 ESAST | **VERIFIED** | **Não como substituto direto** de um A-frame antigo; pode substituir editorialmente um slot de sinalização apenas se o artigo aceitar um easel chalkboard. A pesquisa anterior `B09YLZ323C` redirecionou para este ASIN; usar somente o ASIN canônico atual. |
| TTC-P1 | Plant Sale #1 Outdoor Fence Sign — windproof mesh banner; 2 ft x 3 ft; 4 grommets; fence/wall mount; arte pré-impressa | `B07CS4YXLM` | `https://www.amazon.com/dp/B07CS4YXLM` | In Stock | US$39.99 | Não observado | 2026-09-25 08:31:56 ESAST | **VERIFIED** | **Não como substituto direto** dos quatro ASINs antigos: é banner de cerca/parede, não A-frame nem suporte acrílico. Pode ser alternativa editorial somente para um exemplo de sinalização fixa e específica de “Plant Sale #1”. |

## Correspondência com os quatro ASINs antigos

| ASIN antigo | estado anterior | candidatos vivos que podem ocupar o mesmo tipo geral de slot | decisão de substituição |
|---|---|---|---|
| `B08K1RZWCF` — HBCY A-frame chalkboard 20 x 30 | redirecionava para outro ASIN; `BLOCKED` | `B0718YQBXS` ou `B076RNS74J` | Podem substituir como A-frame alternativos, desde que o texto não prometa o mesmo material, tamanho ou acabamento. `B0F6YJVXQ3` é alternativa de easel, não equivalente direta. |
| `B00IGZCEIM` — Falkenacrylic 5 x 7 / Lilou clear acrylic sign holder | `Page Not Found`; `BLOCKED` | nenhum dos quatro é suporte acrílico 5 x 7 | Não substituído diretamente. Os candidatos vivos são sinalização de chão, easel ou banner e não devem ser apresentados como o mesmo produto/formato. |
| `B08HYJ14RD` — ReunionG A-frame wooden chalkboard 40 x 26 | indisponível e sem preço atual; `BLOCKED` | `B0718YQBXS` ou `B076RNS74J` | Podem substituir como A-frame alternativos, sem afirmar equivalência de madeira, dimensão ou design. |
| `B01HDDD0RQ` — VersaChalk A-frame sidewalk chalkboard 42 x 24 | indisponível e sem preço atual; `BLOCKED` | `B0718YQBXS` ou `B076RNS74J` | Podem substituir como A-frame alternativos, sem afirmar equivalência de dimensão, material ou marca. `B0F6YJVXQ3` só se o slot for redefinido para easel. |

### Decisão de uso

- A evidência permite superar o resultado anterior de **0/4**: há **4/4 candidatos vivos classificados como `VERIFIED`** sob o critério desta versão.
- Isso não significa que os quatro sejam substitutos diretos dos quatro ASINs antigos. Os dois T-SIGN são os substitutos de formato mais próximos para os três slots A-frame; não há substituto direto confirmado para o slot do suporte acrílico 5 x 7.
- A tabela autoriza uma shortlist para revisão editorial, não a edição ou publicação do artigo. Nenhum placeholder foi substituído.

## Limitações e rastreabilidade

### Fatos observados

- A pesquisa Bia v0.2 registrou correspondência entre URL `/dp/<ASIN>` e ASIN exibido na página para os quatro candidatos.
- Os quatro candidatos estavam `In Stock` na consulta; os preços e ratings acima são observações pontuais da página direta.
- No banner `B07CS4YXLM`, rating e reviews não foram observados; não foram inferidos.
- A pesquisa Bia v0.2 registrou que `B09YLZ323C` redirecionou para `B0F6YJVXQ3`; o ASIN antigo da URL redirecionada não deve ser usado como link.

### Limitações que permanecem

- Amazon pode variar preço, vendedor, condição, variante, entrega, localização, cookies, estoque e disponibilidade entre sessões e momentos.
- Preço e disponibilidade não são garantias. O preço observado não deve ser tratado como preço atual na publicação sem nova consulta.
- Rating e reviews são sinais do marketplace; não comprovam tráfego, leads, walk-ins, conversão, vendas ou retorno.
- Claims de resistência, visibilidade ou atração de clientes presentes nos listings continuam sendo claims do vendedor, não evidência de resultado comercial.
- `B0718YQBXS` e `B076RNS74J` não são equivalentes exatos aos A-frames antigos em todas as dimensões e materiais.
- `B0F6YJVXQ3` é um easel chalkboard, não um A-frame clássico; a variante observada é 18 x 35 in e a página apresenta outras opções.
- `B07CS4YXLM` é um banner pré-impresso “Plant Sale #1” para cerca/parede, não uma placa A-frame ou um banner vertical com mastro.
- Nenhuma URL afiliada foi criada. A conversão para link afiliado, se aprovada, deve ocorrer apenas no fluxo autorizado e fora desta tabela.

## Reabertura obrigatória na publicação

Reabrir cada página Amazon.com no momento da publicação para atualizar **preço, estoque, variante e disclosure Amazon Associates**. Não publicar preço ou disponibilidade desta observação como se fossem garantidos ou atuais. A página e os links ainda devem passar pela **QA do Gabe** antes de qualquer publicação ou substituição no artigo.

## Fontes e método

1. `bia-amazon-products-v0.2.md`, pesquisa direta dos quatro candidatos em páginas Amazon.com, observada em 2026-09-25 08:31:56 ESAST.
2. Páginas diretas sem login, compra, credenciais, carrinho ou tags privadas:
   - `https://www.amazon.com/dp/B0718YQBXS`
   - `https://www.amazon.com/dp/B076RNS74J`
   - `https://www.amazon.com/dp/B0F6YJVXQ3`
   - `https://www.amazon.com/dp/B07CS4YXLM`
3. `rick-affiliate-link-table-v0.2.md`, preservada e usada para identificar os quatro ASINs antigos e o resultado anterior de 0/4.
4. A classificação desta versão registra o que foi observado; não transforma observações de marketplace em garantias ou claims de desempenho.

## Integridade do escopo

- Criado/atualizado somente este artefato v0.3.
- `rick-affiliate-link-table-v0.2.md` não foi alterada.
- O artigo TTC-P1 não foi alterado nem publicado.
