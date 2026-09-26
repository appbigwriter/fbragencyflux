# After Forty — Styleguide v0.1

**Status:** Fundação visual criada — aguardando validação editorial do publisher antes de congelar a identidade.
**Mercado:** EN-US global · **Público:** adults 40+ · **Direção:** premium editorial, evidence-led, warm and empowering.

## Design principle

**Confident, not corrective.** After Forty should make aging feel capable, informed, and desirable—not clinical, shame-based, or youth-obsessed. Use generous whitespace, tactile neutrals, and selective rose/sage accents to signal care, credibility, and calm.

## Color system

| Token | Hex | Use |
|---|---|---|
| `--af-paper` | `#FBF8F4` | Primary page background |
| `--af-ink` | `#22201F` | Body copy and headings |
| `--af-ink-soft` | `#5F5955` | Secondary copy, metadata |
| `--af-rose` | `#B76E79` | Primary CTA, links, highlights |
| `--af-rose-dark` | `#8F4F5A` | Hover and accessible dark accent |
| `--af-sage` | `#71857A` | Wellness/category accent |
| `--af-gold` | `#B79055` | Small premium details only |
| `--af-surface` | `#F3EEE8` | Cards and subtle bands |
| `--af-border` | `#DED4CC` | Dividers and form borders |

Rose and sage are accents, never large saturated fields. Body text must remain on paper/white surfaces for comfortable reading.

## Typography

- **Display:** Cormorant Garamond, fallback Georgia. Use for editorial headlines, pull quotes, and the Heidi wordmark.
- **Body/UI:** DM Sans, fallback Arial. Use for navigation, article copy, labels, buttons, and metadata.
- **Technical:** IBM Plex Mono, fallback Consolas. Use sparingly for evidence labels or data notes.
- Recommended headline line-height: `1.05`; body line-height: `1.65`.
- Avoid all-caps paragraphs. Small labels may use uppercase with `0.08em` tracking.

## Component direction

### Header
Minimal, light paper surface, wordmark left, category navigation centered/secondary, newsletter CTA right. Collapse to a menu at mobile widths.

### Buttons
Primary: rose background with white text. Secondary: transparent paper background, ink border. Minimum target size: 44px high. Copy should be specific (`Read the evidence`, `Get the weekly reset`) rather than generic (`Submit`).

### Editorial cards
Paper or white cards with a 1px border, 12px radius, restrained shadow, category eyebrow, serif title, and a concise evidence/context line. No fake star ratings or unsupported health promises.

### Affiliate callouts
Use an explicit `Editor's pick` or `What to look for` label, disclose affiliate relationship near the first commercial module, and distinguish editorial assessment from medical advice. Never imply a product treats a condition without substantiation.

### Evidence notes
Use a sage-tinted surface and a compact source line. Every health claim in published copy needs a source trail in the content workflow; the visual component must not imply clinical endorsement.

## Content hierarchy

1. Eyebrow: category or format (`SKIN / EVIDENCE`)
2. H1: one clear promise or question
3. Deck: who it helps and what the reader will learn
4. Body: short paragraphs, descriptive subheads, lists where useful
5. Action: one next step, never pressure or fear

## Responsive rules

- Base gutter: `clamp(1.25rem, 4vw, 4rem)`.
- Reading measure: max `46rem`; never stretch long-form copy across the full viewport.
- Desktop content max: `72rem`.
- Use a single-column reading experience on mobile; preserve 44px tap targets.
- Respect `prefers-reduced-motion` and maintain visible focus states.

## Asset direction (for Character Bible phase)

Heidi should be represented as a credible, warm editorial host: natural texture, confident posture, real-world settings, and no “anti-aging” visual framing. Prefer documentary lifestyle photography with soft daylight, tactile neutrals, and subtle rose/sage wardrobe accents.

## Acceptance checklist

- [x] Tokens cover color, type, spacing, radius, elevation, focus, and motion.
- [x] CSS is framework-neutral and ready for a future Next.js/Tailwind mapping.
- [x] WCAG-minded focus state and reduced-motion behavior included.
- [x] Editorial and affiliate guardrails documented.
- [ ] Publisher approval of final identity direction.
- [ ] Contrast audit with the eventual component implementation.
