# SharpEye — SEO, Schema & OpenGraph Setup (Proposal)

Status: PROPOSAL — implementation not executed.

## On-page contract

Each article requires one primary intent, descriptive title, one H1, logical H2s, unique meta description, canonical URL, author/persona disclosure, sources, and related content. Avoid keyword stuffing and unsupported outcome claims.

## Proposed schema

- `Organization` / `Person` only where fictional/AI disclosure is explicit.
- `Article` for editorial posts.
- `BreadcrumbList` for nested content.
- `HowTo` only when the page genuinely contains sequential instructions.
- `Product` only for verified catalog data; no invented offers, price, availability, or reviews.

## OpenGraph

Use a stable title, consequence-led description, canonical URL, 1.91:1 social image, alt text, and brand mark. Do not use generated persona imagery as proof of real credentials.

## Acceptance

Run metadata tests, schema validation, sitemap/robots checks, canonical checks, accessibility checks, and browser smoke after implementation. Publication remains gated.
