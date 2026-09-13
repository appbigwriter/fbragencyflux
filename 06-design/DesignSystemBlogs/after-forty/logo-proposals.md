# After Forty by Heidi Braun — logo proposals

**Status:** `PROPOSAL_FOR_APPROVAL`  
**Owner:** Lia — visual identity and creative direction  
**Language:** English  
**Scope:** conceptual directions only; no publication, deployment, production artwork, or external action

## Source boundary

**Verified facts used:** the publication is **After Forty**, signed **by Heidi Braun**; Heidi is an editorial persona of FBR News; the audience is 40+ with a 45+ focus; the market is US/global; the language is English; the documented categories are **Skin & Beauty**, **Recovery & Wellness**, and **Home Fitness**. The shared base is **Nocturne**. The After Forty adaptation explicitly records light mode, **Newsreader**, 8px radius, and hue 42, while stating that Nocturne color tokens remain inherited until separately approved.

**Design hypothesis:** a restrained editorial mark can connect the publication name and byline without making unverified promises about age, health, beauty, expertise, or outcomes. The directions below are hypotheses for Sergio's review, not approved brand claims.

**Preservation rule:** no `_base/Nocturne/` file was changed. These proposals use existing base values only: `--color-bg #161826`, `--color-surface #232532`, `--color-text #e9e9ed`, `--color-accent #9184d9`, `--color-accent-2 #a7a1db`, `--color-neutral-100 #f3f5fe`, `--color-neutral-800 #3f424d`, `--font-heading Inter` in base, and the documented After Forty override `--font-heading/--font-body Newsreader`, `--radius-md 8px`. No new hue-42 color is inferred.

## Direction 01 — The Editorial Nameplate

### Rationale

**Hypothesis:** let the publication name carry the identity through a calm, literary wordmark. The treatment is deliberately typographic rather than illustrative, so it can sit beside evidence-led editorial content without implying a medical, cosmetic, or performance claim.

### Composition

- Horizontal: `After Forty` on one line, with `by Heidi Braun` as a small supporting line aligned to the right edge
- Compact: stacked `After / Forty`, with `by Heidi Braun` beneath
- Monochrome: one-color text and rule; no accent dependency
- The SVG concept uses a small open rule as a layout device, not as a brand claim

### Typography and tokens

- Primary: `Newsreader`, weight 500, from the documented After Forty override
- Supporting text: `Inter`, weight 500, from the Nocturne base
- Letter spacing: use the base's restrained heading spacing; uppercase micro-labels may use the base's `0.08em`–`0.10em` convention
- Color roles: `--color-text` for the name, `--color-accent` for the rule, `--color-neutral-100` on dark applications
- Geometry: 8px corner treatment only where a container is required; do not round the wordmark itself

### Use

Site header, article masthead, newsletter header, author/about surfaces, social avatar only through the compact lockup. Keep clear space at least the cap-height of the `A`; validate again after font loading.

### Risks

- Newsreader rendering varies by platform and may require a licensed/approved production font decision
- A purely typographic mark may have low distinctiveness at favicon scale
- The byline must not be treated as proof of a real person's testimony or credentials; the context defines Heidi as fictional

## Direction 02 — AF Reading Frame

### Rationale

**Hypothesis:** use an `AF` monogram inside a simple open frame, paired with the full name. The frame references an editorial reading surface and the compact initials already documented in the source material; it does not assert a transformation, clinical benefit, or lifestyle outcome.

### Composition

- Horizontal: open-frame `AF` symbol at left; `After Forty` and `by Heidi Braun` in a two-level wordmark at right
- Compact: open-frame `AF` symbol with `After Forty` stacked underneath
- Monochrome: frame, monogram, and type all in one base token; suitable for one-ink print and emboss testing
- Keep the frame open on two sides so it does not become a boxy app icon

### Typography and tokens

- Wordmark: `Newsreader` weight 500
- Byline and utility label: `Inter` weight 500
- Symbol stroke: 1.5–2px at the reference size, matching the base's clear, controlled outline language
- Symbol color: `--color-accent`; text: `--color-text`; dark field: `--color-bg`; light application: use the base neutral ramp and confirm contrast before production
- Radius: if placed in a UI tile, use `--radius-md 8px`; do not alter the base radius token

### Use

Compact site navigation, favicon exploration, podcast/newsletter avatar exploration, article metadata, and monochrome print tests. The full lockup is preferred wherever the publication name can fit.

### Risks

- `AF` alone is ambiguous outside the full lockup
- A framed monogram can resemble a generic media or finance mark; test against the competitive set before approval
- Small-size legibility depends on the final font and stroke calibration

## Direction 03 — The Open Horizon Rule

### Rationale

**Hypothesis:** pair a strong serif name with a single extending rule that creates a quiet editorial horizon. It is a compositional cue for continuity and space, not a promise of vitality, longevity, recovery, or age reversal.

### Composition

- Horizontal: `After Forty` above a short accent rule, with `by Heidi Braun` set below the rule at the left
- Compact: `AF` or the two-line name above a shortened rule; use the full name when context is unknown
- Monochrome: rule and type in one ink, with the rule reduced to a hairline for print
- The rule must stop before the clear-space boundary; never let it collide with nearby navigation or imagery

### Typography and tokens

- Display: `Newsreader` weight 500, matching the documented After Forty type adaptation
- Byline: `Inter` weight 500, matching the base family and utility role
- Rule: `--color-accent` in color applications; `--color-text` in monochrome
- Supporting dark/surface roles: `--color-bg`, `--color-surface`, `--color-text`; optional secondary accent is `--color-accent-2` only where the system already permits a second accent
- Use existing spacing scale (`--space-3`, `--space-4`, `--space-6`) for lockup spacing; do not introduce a logo-only spacing system

### Use

Article masthead, category landing header, email banner, print title page, and wide social cover. Compact version is secondary and should not replace the full name in first-contact contexts.

### Risks

- The rule can disappear in low-resolution or low-contrast placements
- The direction is more dependent on horizontal space than Direction 02
- Without a distinct symbol, recognition may build more slowly at small sizes

## Shared palette and contrast check target

| Role | Existing token | Value | Proposed use |
|---|---|---:|---|
| Background | `--color-bg` | `#161826` | dark presentation field |
| Surface | `--color-surface` | `#232532` | lockup preview tile |
| Text | `--color-text` | `#e9e9ed` | primary wordmark on dark |
| Accent | `--color-accent` | `#9184d9` | rule, frame, or emphasis |
| Accent 2 | `--color-accent-2` | `#a7a1db` | optional existing secondary role |
| Light neutral | `--color-neutral-100` | `#f3f5fe` | one-color light mark on dark |
| Neutral dark | `--color-neutral-800` | `#3f424d` | non-primary structural stroke only |

Basic WCAG contrast should be measured for every final placement. The draft SVGs intentionally use `#e9e9ed` and `#f3f5fe` on `#161826`, and `#9184d9` on `#161826`; no light-background contrast claim is made here until the actual light surface token is approved.

## Approval questions for Sergio

1. Select one direction, or request a controlled hybrid of named elements only
2. Confirm whether `by Heidi Braun` is required in the primary lockup or is a secondary lockup
3. Confirm the production font/licensing path for Newsreader
4. Approve the use of existing `--color-accent` in the mark, or require monochrome-first development
5. Approve the minimum-size and favicon test before any production vector work

## Acceptance criteria

- One direction is explicitly approved by Sergio; no direction is treated as final before that gate
- Final lockup includes the exact publication text `After Forty` and, where used, exact byline `by Heidi Braun`
- Horizontal, compact, and monochrome variants are specified and pass legibility review
- Production files reference approved Design System tokens and do not modify `_base/Nocturne/`
- Contrast is measured on each approved background, with keyboard/focus concerns left to the consuming UI
- No logo usage implies medical advice, guaranteed results, fabricated testimony, or unverified credentials

## Local concept files

- `after-forty/logo-direction-01-nameplate.svg`
- `after-forty/logo-direction-02-af-frame.svg`
- `after-forty/logo-direction-03-horizon-rule.svg`

All SVGs are visibly labeled `DRAFT / NOT FINAL` and are for review only
