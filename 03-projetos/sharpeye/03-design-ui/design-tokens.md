# SharpEye — Design Tokens (Proposal v1)

Status: PROPOSAL — not final brand approval.

## Design direction

Editorial spatial intelligence: architectural clarity, high contrast, restrained warmth, and visual evidence. The interface should feel like a design studio notebook rather than a generic marketing blog.

## Color tokens

| Token | Value | Use |
|---|---|---|
| ink | #111318 | primary background/text on light surfaces |
| paper | #F5F2EC | primary reading surface |
| graphite | #2A2E35 | raised dark surface |
| line | #D8D3C8 | borders/dividers |
| signal | #D86B45 | action/highlight, use sparingly |
| olive | #6E7959 | secondary accent |
| cobalt | #315A78 | links/information |
| muted | #6B6E72 | secondary text |
| success | #3F7257 | positive state |
| warning | #A96D2F | caution state |
| danger | #A94442 | error state |

Accessibility proposal: dark text on paper; paper text on ink; do not use signal/olive as text backgrounds without contrast verification.

## Typography

- Display: Space Grotesk or equivalent geometric sans, subject to license/runtime approval.
- Body: Inter, 16–18px base, 1.55–1.7 line height.
- Metadata: IBM Plex Mono, 12–13px.
- Headings: sentence case; avoid all-caps except compact labels.

## Spacing and shape

- Base spacing: 4px; common scale 4, 8, 12, 16, 24, 32, 48, 64.
- Reading width: 680–760px.
- Content grid: 12 columns desktop; single column mobile.
- Radius: 2px for editorial blocks; 10px maximum for utility cards.
- Shadows: minimal; use borders and tonal surfaces first.

## States

Every interactive or evidence-bearing component needs loading, empty, error, blocked/Gate, and verified states. Provenance, source, date, confidence, and limitation should be visually distinct.

## Pending decisions

Sergio to approve palette, font licenses, logo direction, and whether SharpEye should inherit a broader FBR token layer.
