# SharpEye — Site Architecture (Proposal v1)

Status: PROPOSAL — local planning only; no runtime or remote integration executed.

## Proposed stack

- Next.js + TypeScript
- Supabase/Postgres as the only operational state source
- Object storage for approved media/assets
- Server-side source/provenance records
- No JSON/file store as production state

## Content domains

- `articles`: title, slug, status, intent, persona voice, disclosure, evidence mode.
- `sources`: URL, publisher, retrieved_at, source_type, excerpt/hash, limitation.
- `teardowns`: permission/status, space_context, observation, hypothesis, recommendation.
- `products`: approved catalog reference, relevance, fulfillment status; no invented price/stock.
- `reviews`: owner, status, decision, notes, decided_at.
- `submissions`: consent status, retention policy, publication status; disabled until privacy approval.

## Editorial states

draft → fact_check → review → approved → scheduled → published

Blocked state is explicit and requires reason, owner, nextAction, and nextCheck.

## Routes proposal

- `/` home
- `/the-teardown`
- `/guides/[slug]`
- `/comparisons/[slug]`
- `/about`
- `/sources`
- `/privacy`, `/terms`, `/disclaimer`

## Integration boundaries

- Source retrieval must preserve URL/date/mode and fail closed when retrieval is blocked.
- Product modules read only from an approved catalog.
- Publishing requires human approval and a readback receipt.
- Supabase credentials remain runtime references; never place secrets in the repository.

## Acceptance criteria for future implementation

- All public claims have source or are labeled hypothesis.
- Draft/review/approval transitions persist and read back.
- RLS/tenant policy is tested before production.
- `npm run typecheck`, lint, tests, and build pass.
- Browser smoke covers home, article, disclosure, source, blocked, and empty states.

## Gates

This proposal does not authorize Supabase migration, deployment, domain binding, monetization, or publication. Those require Sergio’s explicit Gate and authorized runtime readback.
