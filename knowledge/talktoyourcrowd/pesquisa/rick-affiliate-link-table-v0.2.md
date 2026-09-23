# Talk to Your Crowd — Rick affiliate-link table v0.2

**Artefato:** `rick-affiliate-link-table-v0.2.md`  
**Responsável:** Rick  
**Projeto:** Talk to Your Crowd by Marcus Cole / FBR News  
**Escopo desta revisão:** follow-up de QA para os quatro ASINs usados em `TTC-P1`  
**Mercado:** Amazon.com / US  
**Consulta:** 2026-09-23, aproximadamente 16:44–16:46 ESAST (UTC−03:00)  
**Gate:** G0 autorizado por Sergio Castro.  
**Versão anterior:** `rick-affiliate-link-table-v0.1.md` foi preservada sem edição.

## Legenda de estados

- `VERIFIED`: identidade, URL canônica Amazon.com, ASIN, variante, preço/rating observado e data confirmados.
- `BLOCKED`: não atende a todos os campos exigidos; o motivo está registrado na linha e no relatório.
- `PENDING`: ainda não pesquisado.
- `affiliate URL/tag status`: somente estado operacional; nenhuma tag privada é registrada neste arquivo.

## Tabela Rick — TTC-P1

> **Regra de segurança:** não há URL afiliada, tag privada, token, segredo, credencial ou informação de login neste artefato. As URLs abaixo são URLs Amazon.com sem parâmetros de afiliado.

| article_id | title | product_name / variante observada | ASIN solicitado | Amazon URL canônica observada | preço observado | rating observado | data/hora da observação | affiliate URL/tag status | QA status | motivo / evidência |
|---|---|---|---|---|---:|---:|---|---|---|---|
| TTC-P1 | 7 Costly Storefront Mistakes Making Customers Walk Right Past You (And How to Fix Them on a Budget) | **BLOCKED:** A Frame Chalkboard by HBCY Creations, 20x30 Solid Wood, double-sided magnetic board; a URL solicitada redirecionou para uma oferta/listing de outro ASIN | B08K1RZWCF | `https://www.amazon.com/clp/B0BQCMYC91` (canônica observada após abrir `https://www.amazon.com/dp/B08K1RZWCF`; não corresponde ao ASIN solicitado) | US$54.99 na página redirecionada | 4.7/5 (5,152) na página redirecionada | 2026-09-23, ~16:45 ESAST | PENDING — nenhuma tag privada inserida | **BLOCKED** | A URL `/dp/B08K1RZWCF` abriu a página HBCY 20x30, mas a URL canônica e a página exibem `B0BQCMYC91`, não `B08K1RZWCF`. A correspondência ASIN/URL/variante não pôde ser confirmada. A observação anterior da Bia (40x20, US$69.99, 4.7/5, 3,991 reviews) conflita com a página viva e não foi promovida como dado atual. |
| TTC-P1 | 7 Costly Storefront Mistakes Making Customers Walk Right Past You (And How to Fix Them on a Budget) | **BLOCKED:** variante/nome não confirmáveis; página Amazon indisponível | B00IGZCEIM | Não observada — `https://www.amazon.com/dp/B00IGZCEIM` retornou `Page Not Found` | não observado | não observado | 2026-09-23, ~16:45 ESAST | PENDING — nenhuma tag privada inserida | **BLOCKED** | Não foi possível confirmar URL canônica, nome/variante, preço ou rating na Amazon.com. A Bia havia registrado Falkenacrylic 5x7 e rating 5.0/5 (1 review), sem preço; isso não substitui a confirmação viva exigida. |
| TTC-P1 | 7 Costly Storefront Mistakes Making Customers Walk Right Past You (And How to Fix Them on a Budget) | ReunionG A-Frame Wooden Chalkboard, double-sided rustic standing blackboard, removable, 40x26; indoor/outdoor menu sign | B08HYJ14RD | `https://www.amazon.com/clp/B08HYJ14RD` (canônica observada; ASIN coincide) | não observado — página informa “Currently unavailable” | 4.8/5 (36) | 2026-09-23, ~16:45 ESAST | PENDING — nenhuma tag privada inserida | **BLOCKED** | ASIN, URL canônica, nome/variante e rating foram confirmados; preço atual não pôde ser confirmado porque o item estava indisponível. Não registrar o preço de US$47.99 da busca anterior como preço atual. |
| TTC-P1 | 7 Costly Storefront Mistakes Making Customers Walk Right Past You (And How to Fix Them on a Budget) | VersaChalk A-Frame Sidewalk Chalkboard, 42x24 | B01HDDD0RQ | `https://www.amazon.com/clp/B01HDDD0RQ` (canônica observada; ASIN coincide) | não observado — página informa “Currently unavailable” | 4.3/5 (218) | 2026-09-23, ~16:45 ESAST | PENDING — nenhuma tag privada inserida | **BLOCKED** | ASIN, URL canônica, nome/variante e rating foram confirmados; preço atual não pôde ser confirmado porque o item estava indisponível. Não preencher com preço inferido ou histórico. |

## Relatório curto de correspondência

### Resultado

- **0/4 VERIFIED** sob o critério completo exigido (URL canônica Amazon.com + ASIN coincidente + nome/variante + preço/rating observados + data).
- **4/4 BLOCKED**.
- Nenhuma URL afiliada foi criada e nenhuma tag privada foi inserida.
- O artigo não foi editado e nada foi publicado.

### Fontes e método

1. **Amazon.com — páginas diretas de produto**, abertas sem login, compra ou alteração de carrinho:
   - `https://www.amazon.com/dp/B08K1RZWCF`
   - `https://www.amazon.com/dp/B00IGZCEIM`
   - `https://www.amazon.com/dp/B08HYJ14RD`
   - `https://www.amazon.com/dp/B01HDDD0RQ`
2. Foram conferidos título, URL efetiva/canônica, ASIN presente na página, variante, disponibilidade, preço exibido, rating e contagem de avaliações.
3. **Fonte contextual:** `bia-amazon-products-v0.1.md`, linhas 22–26 e 40–44, usada apenas para comparar as observações anteriores; conflitos não foram resolvidos por inferência.
4. **Data da consulta:** 2026-09-23; relógio local retornou aproximadamente `16:46:40 ESAST (UTC−03:00)`.

### Limitações e bloqueios

- Amazon pode variar por localização, disponibilidade, vendedor, sessão, variante e momento; a consulta foi feita sem login.
- B08K1RZWCF redirecionou para uma página canônica de outro ASIN (`B0BQCMYC91`), portanto não é uma correspondência válida para o ASIN solicitado.
- B00IGZCEIM retornou `Page Not Found`; não há evidência viva suficiente para preencher os campos.
- B08HYJ14RD e B01HDDD0RQ exibiram identidade e rating, mas estavam indisponíveis e não exibiram preço atual.
- Rating e reviews são observações de marketplace; não comprovam tráfego, leads, reviews, aumento de ticket ou vendas.
- O backend de busca web Firecrawl retornou 403 nesta sessão; a confirmação principal foi feita por abertura direta das URLs no navegador e os resultados indexados foram tratados apenas como contexto.

### Decisão de QA

Manter os quatro itens como `BLOCKED`. Não substituir placeholders do artigo, não criar links afiliados e não publicar até que cada ASIN tenha uma página Amazon.com viva com correspondência inequívoca de ASIN/URL/variante e os campos de preço/rating exigidos observados e datados.
