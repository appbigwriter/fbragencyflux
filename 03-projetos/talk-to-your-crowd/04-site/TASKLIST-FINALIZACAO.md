# Site Finalization Tasklist — Talk to Your Crowd

Version: 1.0
Scope: turn the current static prototype into a publishable editorial website
Source assessment: pasted technical audit received on 2026-09-28

## Definition of done

The site is considered ready for Sergio’s deploy gate only when:

- Content can be published and rendered from one defined source of truth.
- Every article has a real slug, metadata, canonical URL and readable layout.
- `/articles` lists real posts and supports the chosen taxonomy.
- Search, newsletter capture and legal pages work in the target environment.
- Mobile, tablet and desktop QA pass.
- Build, security audit, links, forms and SEO checks pass.
- No deploy occurs without Sergio’s explicit approval.

## Phase 0 — Decisions and technical foundation

- [ ] D0.1 — Decide the content source of truth: MDX files in the repository, Supabase/Postgres, or a headless CMS.
  - Acceptance: decision recorded in `04-site/ARCHITECTURE.md` with rationale, migration implications and owner.
- [ ] D0.2 — Confirm the production URL and canonical URL policy.
  - Acceptance: one canonical host is defined; redirects and metadata rules are documented.
- [ ] D0.3 — Confirm lead destination and consent policy.
  - Acceptance: chosen provider, fields, consent copy, unsubscribe path and privacy retention policy are documented.
- [ ] D0.4 — Define the content model.
  - Required fields: `slug`, `title`, `description`, `datePublished`, `dateModified`, `author`, `category`, `tags`, `readingTime`, `coverImage`, `body`, `status`.
  - Acceptance: schema exists in code or database and rejects incomplete posts.

## Phase 1 — Content pipeline

- [ ] C1.1 — Move the first article batch into the chosen content source.
  - Acceptance: the three existing articles are readable without hardcoded article content in page components.
- [ ] C1.2 — Implement real slug resolution.
  - Acceptance: `/articles/[slug]` renders the requested article; unknown slugs return a real 404.
- [ ] C1.3 — Add Markdown/MDX or CMS rendering with safe HTML handling.
  - Acceptance: headings, lists, links, callouts, disclosure blocks and paragraph spacing render correctly.
- [ ] C1.4 — Create an article list at `/articles`.
  - Acceptance: published articles appear as cards with title, excerpt, date/category and working links.
- [ ] C1.5 — Add pagination or an explicit load-more strategy.
  - Acceptance: behavior is deterministic with more than one page of content and has accessible controls.
- [ ] C1.6 — Add categories and tags.
  - Acceptance: category/tag links filter real content and empty taxonomies do not produce broken pages.
- [ ] C1.7 — Add related-article links.
  - Acceptance: every article has at least two relevant internal links or a documented empty-state rule.

## Phase 2 — Search and discovery

- [ ] S2.1 — Implement article search.
  - Acceptance: users can search title, excerpt and tags; empty and no-result states are clear.
- [ ] S2.2 — Add primary navigation routes: Home, Articles, About, Contact and Disclaimer.
  - Acceptance: every route works from desktop and mobile navigation.
- [ ] S2.3 — Add RSS/Atom feed.
  - Acceptance: feed validates and includes title, URL, publication date and summary for published articles.
- [ ] S2.4 — Add sitemap entries for all published articles and taxonomy pages.
  - Acceptance: no draft or missing-slug page is included.

## Phase 3 — Lead capture and commercial readiness

- [ ] L3.1 — Implement the checklist form as a real server-side submission.
  - Acceptance: valid submissions reach the chosen provider; invalid submissions show field-level errors; no secret is exposed client-side.
- [ ] L3.2 — Add consent and privacy copy beside the form.
  - Acceptance: the user understands what will be sent, frequency and how to unsubscribe.
- [ ] L3.3 — Add rate limiting, honeypot or CAPTCHA protection as appropriate.
  - Acceptance: automated spam submission is rejected or throttled.
- [ ] L3.4 — Implement affiliate callouts as a reusable component.
  - Acceptance: disclosure is visible, links use the correct `rel` attributes and the component supports non-affiliate alternatives.
- [ ] L3.5 — Add product/service attribution hooks.
  - Acceptance: commercial clicks can be distinguished by article, placement and campaign without exposing personal data.

## Phase 4 — SEO and editorial quality

- [ ] E4.1 — Generate per-article metadata.
  - Acceptance: title, description, canonical URL and Open Graph values change with the article.
- [ ] E4.2 — Add Article and BreadcrumbList JSON-LD.
  - Acceptance: structured data contains only facts present in the post and validates without critical errors.
- [ ] E4.3 — Add image pipeline and alt-text validation.
  - Acceptance: meaningful images have descriptive alt text; decorative images are marked appropriately; formats are optimized.
- [ ] E4.4 — Add legal and disclosure links to the global footer.
  - Acceptance: About, Contact and Disclaimer are reachable from every public route.
- [ ] E4.5 — Add editorial status rules.
  - Acceptance: draft content cannot enter article lists, feeds or sitemap.

## Phase 5 — UX, accessibility and performance

- [ ] Q5.1 — Test at 390px, 768px and 1440px.
  - Acceptance: no horizontal overflow, clipped text or inaccessible controls.
- [ ] Q5.2 — Test keyboard navigation and visible focus states.
  - Acceptance: all links, form controls, navigation and search work without a mouse.
- [ ] Q5.3 — Test semantic heading hierarchy and landmarks.
  - Acceptance: one H1 per page, logical H2/H3 sequence, labeled navigation and form fields.
- [ ] Q5.4 — Run Lighthouse or equivalent performance checks.
  - Acceptance: record results and fix critical accessibility, SEO and performance findings.
- [ ] Q5.5 — Verify external fonts, images and scripts do not block core content.
  - Acceptance: page remains readable and usable if third-party assets fail.

## Phase 6 — QA and release preparation

- [ ] R6.1 — Run `npm run build` from the physical `04-site` directory.
- [ ] R6.2 — Run `npm audit --omit=dev --audit-level=high`.
- [ ] R6.3 — Test all routes, unknown slugs, search, taxonomy, feed, sitemap and robots.
- [ ] R6.4 — Test successful and failed lead submissions in a non-production environment.
- [ ] R6.5 — Check for secrets, debug output, broken links and placeholder copy.
- [ ] R6.6 — Update `QA-REPORT.md` with commands, results, findings and unresolved risks.
- [ ] R6.7 — Prepare a release checklist with rollback instructions.

## Phase 7 — Sergio gate

- [ ] G7.1 — Present the staging URL or local verification evidence to Sergio.
- [ ] G7.2 — Present unresolved risks, especially lead provider, privacy and content-source decisions.
- [ ] G7.3 — Obtain explicit deploy approval.
- [ ] G7.4 — Deploy only after approval.
- [ ] G7.5 — Verify production URL, HTTP status, canonical metadata, robots, sitemap, form delivery and error logs.

## Recommended execution order

1. D0.1–D0.4
2. C1.1–C1.7
3. S2.1–S2.4
4. L3.1–L3.5
5. E4.1–E4.5
6. Q5.1–Q5.5
7. R6.1–R6.7
8. G7.1–G7.5

## Current known risks

- The existing audit describes a static prototype, not a finished CMS-backed blog.
- The current lead form is visual only until a provider and consent flow are implemented.
- The content-source decision must be made before building dynamic article lists and search.
- Deploy is a one-way-door action and remains blocked until Sergio approves it.
