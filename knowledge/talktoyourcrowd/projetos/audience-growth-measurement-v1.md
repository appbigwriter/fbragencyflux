# Talk to Your Crowd — Organic Audience Growth & Attention Measurement v1

**Project:** Talk to Your Crowd  
**Persona:** Marcus Cole — Retail Growth & Storefront Strategist  
**Publisher:** FBR News  
**Language:** EN-US  
**Market:** United States / Global  
**Phase:** Persona authority only  
**Status:** Planning artifact; no media, spend, product association, or publication approval implied

## 1. Scope and operating guardrails

This plan is limited to organic audience acquisition and measurement of attention for the Marcus Cole persona. It does not activate paid media, allocate budget, connect products, create affiliate links, or make sales claims.

- **In scope:** editorial distribution, audience hypotheses, generic event taxonomy, UTM convention, authority KPIs, readback routine, learning decisions.
- **Out of scope:** paid campaigns, boosts, sponsored distribution, ASINs, affiliate links, prices, ratings, availability, product recommendations, product claims, and revenue optimization.
- **Primary objective:** build a recognizable, useful, consistent editorial authority around storefront visibility, point-of-sale attention, and lead/loyalty capture for small businesses.
- **Primary audience:** small business owners in retail, dining, salons/clinics, and event vending.
- **Primary editorial CTA:** read, save, follow/subscribe, return, or complete the editorial *10-Minute Storefront Audit* when that asset is available. No commercial CTA is required.

## 2. Facts, hypotheses, decisions, and blockers

### Facts from the operating context

- The persona is fictitious and publicly declared.
- The project operates in EN-US for the United States / Global market.
- The stated audience includes retail, dining, salons/clinics, and event vendors.
- The authority-first phase must not depend on product association.
- The current operating mode requires simplified coordination, few handoffs, and no product blocker.

### Audience hypotheses (not validated results)

| ID | Hypothesis | Confidence | Test signal |
|---|---|---:|---|
| H1 | Owners and operators respond to practical, location-aware fixes they can understand quickly. | Medium | Qualified reach, first-30-second retention, saves, and return visits by topic. |
| H2 | Storefront and visibility content is a stronger discovery entry point than abstract marketing advice. | Medium | Non-follower reach and profile visits on storefront-led posts versus general posts. |
| H3 | Concrete checklists, audits, and before/after frameworks earn more saves and subscriptions than opinion-only posts. | Medium | Save rate and subscribe/follow conversion by format. |
| H4 | Segment-specific examples for retail, dining, salons/clinics, and event vendors improve qualified attention. | Low/Medium | Segment-tagged reach quality, retention, saves, and recurring audience. |
| H5 | Consistent Marcus Cole voice and visual cues improve repeat recognition over time. | Low | Returning viewers/readers, repeat engagers, and direct/profile-led sessions. |

### Decisions

- Start with organic distribution across owned editorial channels and public social discovery surfaces already approved for the project: Site/Blog, Instagram, TikTok, and YouTube.
- Treat the blog as the durable reference layer and social channels as discovery, explanation, and redistribution layers.
- Use one generic event vocabulary and one UTM convention across channels.
- Review authority signals before considering any future commercial or paid phase.

### Blockers and dependencies

- Exact platform analytics access and account-level definitions must be confirmed before reporting observed results.
- Publication, public posting, and any external mutation remain subject to the applicable human approval gate.
- No baseline or performance result is claimed by this document; baselines begin only after verified readback exists.

## 3. Minimum organic channel plan

| Channel | Role | Minimum content behavior | Primary audience hypothesis | Main attention signals |
|---|---|---|---|---|
| Site/Blog | Durable authority and searchable reference | Pillar articles, practical checklists, segment examples, and internal links between related authority pieces | Owners seek actionable answers when a storefront or in-person experience problem is visible | Qualified organic sessions, engaged time, scroll depth, return sessions, audit starts/completions, subscriptions |
| Instagram | Recognition, conversation, and lightweight discovery | Stories, carousels, concise educational posts, question prompts, and excerpts that point to the editorial context | Visually clear, fast-to-scan guidance creates saves and profile visits | Qualified reach, 3-second/first-frame hold where available, completion, saves, shares, profile visits, follows, repeat engagers |
| TikTok | Discovery and rapid testing of hooks | Short explainers with one problem, one principle, and one practical next step | Strong hooks around visible storefront/POS problems attract operators who do not yet know Marcus | Qualified views, retention curve, completion, rewatches, saves, profile visits, follows, returning viewers |
| YouTube Shorts | Searchable short-form authority and repeat exposure | Short lessons adapted from pillar content, with a clear topic title and consistent persona framing | Practical explanations can compound through search and recommendation | Qualified views, average percentage viewed, completion, returning viewers, channel subscriptions, saves/shares where available |

**Distribution rule:** adapt the same editorial idea to each channel; do not copy platform metrics into a single undifferentiated total. A person reached on multiple platforms may be counted once per platform and separately in the deduplicated audience view only when a reliable identity-level method exists.

## 4. Minimum content test matrix

Use a small rotating set of editorial patterns rather than expanding volume before learning quality.

| Test family | Example editorial angle | Expected authority signal |
|---|---|---|
| Visibility fix | “What a passerby should understand in five seconds” | Qualified reach, retention, saves |
| Storefront audit | One-minute or ten-minute diagnostic checklist | Saves, shares, audit starts, subscriptions |
| Segment lens | Same principle adapted for a diner, salon/clinic, retailer, or event vendor | Qualified reach, retention, recurring audience by segment |
| Point-of-sale attention | How to reduce friction at the decision point | Retention, saves, comments with specific questions |
| Myth versus practice | Replace vague advice with an observable action | Completion, saves, profile visits |
| Field note / scenario | Clearly labeled illustrative scenario with no invented testimonial | Retention, returning viewers, subscriptions |

Do not present illustrative scenarios as customer results, testimonials, or measured outcomes.

## 5. Generic event taxonomy

Event names are measurement labels only. They do not imply that instrumentation has been installed or that events have occurred.

### Acquisition and attention events

| Event | Meaning | Required parameters |
|---|---|---|
| `content_impression` | Content was rendered or registered by the platform/source | `platform`, `content_id`, `content_format`, `topic`, `segment`, `source` |
| `content_view_start` | A view reached the platform/source minimum view definition | `platform`, `content_id`, `view_definition`, `topic`, `segment` |
| `content_engaged` | Viewer/reader crossed the agreed engaged-attention threshold | `platform`, `content_id`, `engagement_rule`, `elapsed_seconds` or `engaged_time` |
| `content_complete` | Content reached the agreed completion threshold | `platform`, `content_id`, `completion_rule`, `content_length` |
| `content_save` | User saved/bookmarked the content | `platform`, `content_id`, `topic`, `segment` |
| `content_share` | User shared the content | `platform`, `content_id`, `share_surface` |
| `profile_visit` | User opened the persona/profile surface | `platform`, `content_id`, `source_surface` |
| `subscription_start` | User followed/subscribed to the persona channel or editorial list | `platform`, `source_content_id`, `subscription_type` |
| `return_visit` | Known analytics session returned within the reporting window | `platform`, `entry_content_id`, `days_since_prior_visit` |
| `audit_start` | User began the editorial audit experience | `source`, `utm_campaign`, `content_id` |
| `audit_complete` | User completed the editorial audit experience | `source`, `utm_campaign`, `content_id` |

### Event hygiene

- Use stable `content_id` values; never place personal data, secrets, prices, ASINs, or affiliate identifiers in event parameters.
- Define platform-specific view and completion thresholds in the measurement log before comparing channels.
- Preserve raw platform totals and a normalized reporting table; do not silently merge incompatible definitions.
- Record the analytics source, extraction date, timezone, and reporting window for every readback.

## 6. Generic UTM convention

Use UTMs for links that the project controls, such as blog, audit, newsletter, or owned landing-page links. Social-native views that never open a controlled link remain platform-native measurements and should not be assigned invented UTMs.

```text
utm_source   = lowercase channel or referrer (instagram|tiktok|youtube|newsletter|organic_search)
utm_medium   = organic_social|organic_video|organic_search|owned_email
utm_campaign = lowercase initiative_slug (e.g., storefront_audit_q1)
utm_content  = stable content_id or creative_variant (e.g., mc_storefront_5sec_a)
utm_term     = optional topic_or_segment_slug; omit when not useful
```

**Example (generic, non-commercial):**

```text
https://talktoyourcrowd.fbr.news/audit
?utm_source=instagram
&utm_medium=organic_social
&utm_campaign=storefront_audit_q1
&utm_content=mc_audit_reel_01
&utm_term=retail
```

Rules:

1. Lowercase values; use underscores, not spaces.
2. Keep `utm_campaign` stable for the initiative window.
3. Change `utm_content` for a meaningful creative or hook variant.
4. Never use UTMs to encode a product, affiliate tag, price, personal data, or unsupported claim.
5. Keep a small UTM registry with owner, date created, content ID, destination, and status.

## 7. Authority KPI scorecard

Report absolute values and rates. Rates must include numerator, denominator, source, window, and definition.

| KPI | Operational definition | Suggested view |
|---|---|---|
| Qualified reach | Reach from the intended US/Global small-business audience, using available platform audience/location/interest proxies; label as estimated when not directly identifiable | By channel, segment, topic, and new vs returning where available |
| Attention retention | Share of viewers/readers who pass the agreed time or completion threshold | Retention curve plus median/average; never substitute impressions for retention |
| Saves | Count of explicit saves/bookmarks | Absolute saves and saves per qualified reach/view |
| Subscriptions | New follows/subscriptions or editorial list sign-ups attributable to the content/source | Net new, gross new, and conversion from engaged audience |
| Recurrence | Returning viewers/readers or repeat engaged users within a defined window | 7-, 28-, and 90-day returning cohorts where the source supports it |
| Engaged sessions | Sessions meeting the agreed engaged-time or interaction rule | By UTM source/medium/campaign/content |
| Authority action rate | Saves + shares + subscriptions + meaningful comments divided by qualified reach or engaged views | Use only when denominator definitions are compatible |
| Content depth | Scroll depth, engaged time, or completion proxy for long-form content | By pillar, format, and segment |
| Topic efficiency | Authority actions per 1,000 qualified reach/views | Compare only within the same channel and definition set |

### Minimum reporting cuts

- Channel: Site/Blog, Instagram, TikTok, YouTube.
- Audience lens: retail, dining, salons/clinics, event vendors, unknown.
- Content lens: topic, format, content ID, hook/test family.
- Audience state: new/non-following, following/subscribed, returning where available.
- Time: weekly operating read, 28-day trend, and 90-day authority view.

Do not set a numerical target in this artifact without a verified baseline and an explicit decision owner. The initial purpose is measurement quality and learning, not a promised reach or follower result.

## 8. Minimum reading routine

### Weekly operating read — owner: Rafa with Íris

1. Export or read back platform-native and site analytics for the prior seven days.
2. Confirm source, timezone, date window, definitions, and missing fields.
3. Check qualified reach, retention, saves, subscriptions, and recurrence by channel and content ID.
4. Identify the top two positive signals and top two weak signals; do not infer causality from one post.
5. Tag each observation as **FACT**, **HYPOTHESIS**, **BLOCKER**, or **DECISION**.
6. Select at most one next organic test per channel or defer testing if data quality is insufficient.

### 28-day authority review — owner: Íris / Marcus Cole

- Compare topic families and segment lenses using normalized rates.
- Review whether saves and subscriptions are coming from qualified attention rather than broad, low-retention reach.
- Inspect returning cohorts and repeat engagement for signs of persona recognition.
- Retire or revise weak hypotheses only when the sample and definitions are adequate; otherwise mark them as unresolved.
- Update the content test matrix and editorial brief; do not activate paid distribution from this review.

### 90-day phase review — owner: Sergio at the applicable gate

- Review trend direction, baseline quality, audience fit, retention, saves, subscriptions, and recurrence.
- Decide whether persona authority is sufficiently evidenced for the next planning phase.
- Keep product association and paid media as separate future decisions; neither is implied by a positive organic result.

## 9. Readback record template

```text
READBACK_ID:
REPORTING_WINDOW:
TIMEZONE:
EXTRACTION_DATE:
OWNER:
SOURCES:

FACTS:
- Channel / content ID / metric / numerator / denominator / rate / source

HYPOTHESES:
- What may explain the observed signal; confidence and next test

BLOCKERS:
- Missing access, incompatible definition, insufficient sample, or pending approval

DECISIONS:
- Organic test, content revision, hold, or escalation; owner and next readback date

DATA_QUALITY:
- Complete / partial / estimated; known caveats
```

## 10. Acceptance criteria

- Covers organic channels, audience hypotheses, generic events, UTMs, authority KPIs, and a reading routine.
- Separates facts, hypotheses, blockers, and decisions.
- Defines qualified reach, retention, saves, subscriptions, and recurrence without inventing results.
- Uses generic identifiers and excludes ASINs, affiliate tags, prices, product claims, and paid activation.
- States that publication, instrumentation, and external mutation require their applicable approval and verification.
- Provides a repeatable readback record with source, window, definitions, and data-quality caveats.

**Handoff:** Rafa owns the audience-growth/tracking brief; Íris consolidates it with the persona authority roadmap; Gabe may audit the artifact for scope, traceability, and compliance. No media activation or product handoff is included.
