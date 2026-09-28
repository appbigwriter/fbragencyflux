# SharpEye — QA Audit Plan (Proposal)

Status: PROPOSAL — execution depends on an implemented local site.

## Test layers

1. Content: sources, disclosure, claims, links, metadata, headings.
2. Accessibility: keyboard navigation, focus, contrast, alt text, reduced motion, semantic landmarks.
3. Performance: image sizing, font loading, Core Web Vitals after runtime exists.
4. SEO: canonical, sitemap, robots, schema, OpenGraph, 404, redirects.
5. Security: auth boundaries, consent, no secrets, no unapproved submission writes.
6. Responsive: 360px, tablet, desktop; evidence labels remain visible.

## Acceptance

Record command, timestamp, URL/path, result, severity, evidence, owner, and nextAction. Do not call the site ready until critical/high findings are resolved and read back.
