# QA Report — Talk to Your Crowd

**Date:** 2026-09-26  
**Scope:** current Next.js prototype and editorial deliverables  
**Status:** QA completed with one production-readiness finding

## Automated checks

| Check | Result | Evidence |
|---|---|---|
| Production build | PASS | `npm run build` completed successfully with Next.js 16.3.6 |
| Dependency security | PASS | `npm audit --omit=dev --audit-level=high` returned `found 0 vulnerabilities` |
| TypeScript validation | PASS | Next build completed TypeScript validation |
| Static route generation | PASS | `/`, `/articles/7-storefront-mistakes`, `/robots.txt` and `/sitemap.xml` generated |
| Browser console | PASS | Homepage and article route tested locally with zero JS errors |
| Metadata | PASS | Root metadata includes title, description and Open Graph fields |
| Crawl controls | PASS | `robots.ts` and `sitemap.ts` present |
| Secret exposure | PASS | No API keys or credentials included in frontend source |

## UX and accessibility review

- Responsive breakpoints are defined for mobile, tablet and desktop layouts.
- Visible focus treatment exists for primary interactive controls.
- `prefers-reduced-motion` is respected.
- Semantic landmarks, headings, labels and article structure are present.
- Contrast and final rendering should receive a visual sign-off at 390px, 768px and 1440px before production.

## Compliance review

- Affiliate callout includes a nearby disclosure.
- Editorial copy avoids guaranteed sales claims, invented testimonials and unsupported performance numbers.
- Product recommendations are framed as implementation options.
- Disclaimer covers educational scope, affiliate relationships, results, privacy and local sign regulations.
- QR lead-capture content requires permission-based collection and applicable US/Canadian privacy compliance.

## Production-readiness finding

The homepage checklist form is currently a presentation prototype. It does not yet connect to an email, CRM or database provider. It must not be treated as live lead capture until delivery, consent, privacy notice and unsubscribe handling are implemented and tested.

This is recorded as a release condition, not a build failure. The deploy gate remains open and requires Sergio’s approval.

## Conclusion

The current prototype passes build, dependency, route, console and baseline SEO checks. Production publication should wait for the lead-form integration and final visual review across the three target widths.
