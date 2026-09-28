# Image Asset Brief — Talk to Your Crowd

## Current audit

The current physical site has no `<img>`, `next/image`, background image or image asset directory. Visuals are currently CSS-only: typography, colored signal card and layout blocks. The first image pass should add editorial assets without turning the site into a generic stock-photo blog.

## Image principles

- Show the customer decision and physical touchpoint before showing a product.
- Use real-looking storefronts, counters, reception desks, tables and booths.
- Avoid fake sales numbers, fake testimonials, visible third-party trademarks and unreadable AI-generated text.
- Generate clean negative space so real HTML headlines remain the readable text layer.
- Use the Editorial Signal palette: ink navy, warm paper, coral, mint and yellow.
- Prefer documentary editorial realism with controlled studio lighting, not glossy advertising stock.
- All generated images require human review for text artifacts, logos, hands, signage legibility and commercial claims.

## Priority assets

### IMG-001 — Homepage hero touchpoint

- Status: required
- File: `04-site/public/images/hero-touchpoint.webp`
- Aspect: 16:9 desktop master, with safe center crop for mobile
- Suggested size: 2400 × 1350
- Use: homepage hero visual replacing or complementing the current CSS signal card
- Prompt: “Editorial documentary photograph of a small independent business storefront at blue hour, a clear blank sign panel and warm interior counter visible through the window, one passerby noticing the entrance, sophisticated design magazine composition, warm paper highlights, ink navy shadows, coral and mint accents in small environmental details, realistic materials, no readable words, no logos, generous negative space on the left for a headline, United States or Canadian urban neighborhood, premium but accessible, natural human proportions”
- Negative prompt: “logos, brand names, readable AI text, fake sales claims, excessive neon, empty sterile showroom, distorted hands, extra limbs, watermark”

### IMG-002 — Four-touchpoint editorial strip

- Status: required
- File: `04-site/public/images/touchpoints-strip.webp`
- Aspect: 4:1 horizontal strip or four coordinated square crops
- Suggested size: 2400 × 600 master, plus 1200 × 1200 crops
- Use: strategy pillar section: storefront, counter, reception and event booth
- Prompt: “Four-panel editorial contact sheet showing the same visual language across four customer touchpoints: storefront sidewalk sign, retail counter display, service reception desk with discreet QR card, trade-show booth with clear wayfinding, realistic small-business environments, warm paper and ink palette, coral signal accents, no readable words, no logos, consistent camera and lighting”
- Negative prompt: “collage borders, random typography, brand logos, exaggerated crowds, glossy corporate convention center, unreadable fake text”

### IMG-003 — Point-of-sale audit cover

- Status: required
- File: `04-site/public/images/point-of-sale-audit.webp`
- Aspect: 4:5 portrait
- Suggested size: 1600 × 2000
- Use: lead magnet card and newsletter CTA
- Prompt: “Top-down editorial design-studio photograph of a point-of-sale audit workspace: blank paper checklist, pencil, measuring tape, small acrylic sign holder, color swatches in ink navy, warm paper, coral, mint and yellow, tactile paper texture, precise composition, no readable text, no logos, generous blank area for HTML title overlay”
- Negative prompt: “fake words, visible brand marks, clutter, hands, stock-photo smile, excessive props”

### IMG-004 — Storefront mistakes article cover

- Status: required
- File: `04-site/public/images/storefront-mistakes.webp`
- Aspect: 16:9
- Suggested size: 2000 × 1125
- Use: article card and Open Graph image for “7 Storefront Mistakes”
- Prompt: “Editorial before-and-after concept of a small storefront viewed from the sidewalk, left side visually cluttered with competing blank poster shapes, right side clear with one simple blank message panel and visible entrance, realistic architecture, warm paper and ink palette, no readable text, no logos, analytical design magazine photography”
- Negative prompt: “literal before-after labels, readable text, fake logos, guaranteed sales imagery, distorted architecture”

### IMG-005 — QR counter capture article cover

- Status: required
- File: `04-site/public/images/qr-counter-capture.webp`
- Aspect: 16:9
- Suggested size: 2000 × 1125
- Use: article card and Open Graph image for QR lead capture
- Prompt: “Close editorial photograph of a small business counter with a blank tabletop QR display, a phone positioned nearby but screen content abstract and unreadable, warm natural light, premium practical retail design, ink navy shadows with coral and mint accents, realistic acrylic and paper textures, no logos, no readable text”
- Negative prompt: “functional QR code, fake scannable code, readable phone UI, brand logos, payment details, clutter”

### IMG-006 — Universal Open Graph image

- Status: required
- File: `04-site/public/images/og-talk-to-your-crowd.webp`
- Aspect: 1.91:1
- Suggested size: 1200 × 630
- Use: default social sharing image
- Prompt: “Editorial still life representing physical customer touchpoints: small blank storefront sign, counter card, clipboard checklist and measuring tape arranged on warm paper surface, ink navy background edge, coral signal accent, mint detail, refined business publication art direction, no readable words, no logos, wide negative space for HTML or social title overlay”
- Negative prompt: “fake text, logos, generic office desk, money, sales graph, exaggerated claims, watermark”

## Optional second pass

- `touchpoint-teardown-template.webp`: 3:2 neutral scene for recurring teardown articles.
- `signage-autopsy-template.webp`: 3:2 close view of sign hierarchy, distance and glare.
- `trade-show-booth.webp`: 16:9 event booth with blank modular graphics.
- `counter-add-on.webp`: 4:5 tabletop add-on prompt with blank card.
- `newsletter-banner.webp`: 3:1 wide banner derived from IMG-006.

## Technical delivery requirements

- Preferred formats: WebP for content images, AVIF where the pipeline supports it, PNG only for transparent logos or diagrams.
- Preserve source masters separately from web exports.
- Store web assets in `04-site/public/images/`.
- Add descriptive alt text in the article/content model; decorative images must use empty alt text.
- Use `next/image` with explicit dimensions and responsive `sizes`.
- Do not embed text generated inside the image when HTML text can be used.
- Do not use an image as evidence of a measured sales result.

## Acceptance checklist

- [ ] IMG-001 generated and reviewed at desktop/mobile crop.
- [ ] IMG-002 generated as a consistent set.
- [ ] IMG-003 generated for lead magnet CTA.
- [ ] IMG-004 and IMG-005 generated for article cards/OG.
- [ ] IMG-006 generated as default OG image.
- [ ] Human review completed for artifacts, logos, hands and accidental claims.
- [ ] Alt text written and mapped to each usage.
- [ ] Images integrated with `next/image`.
- [ ] Build and image optimization verified.
