# Pending projects — logo briefing framework

**Scope:** `blog-02`, `blog-03`, and `blog-04` only  
**Status:** `NAME_PENDING` / no logo concepts created

This framework intentionally does not create names, personas, positioning, claims, palettes, or fictional logos. Each project must be briefed after its official identity is supplied.

## Required briefing inputs

1. Official publication name and exact capitalization
2. Byline/publisher relationship and approved public wording
3. Persona status: real, fictional, collective, or unset
4. Audience, market, language, and editorial categories
5. Positioning and prohibited claims, with source documents
6. Required signature, disclaimer, disclosure, and accessibility constraints
7. Approved adaptation inputs: mode, typeface, radius, hue or color tokens, density, imagery
8. Required logo contexts: header, compact mark, favicon, social, print, monochrome
9. Decision owner and approval gate

## Design-system guardrails

- Start from `../_base/Nocturne/`; it is the shared read-only-by-default source
- Keep each adaptation in its own project folder; never edit or duplicate the base to serve one blog
- Use existing tokens before proposing additions; record every approved divergence
- Preserve typography, spacing, radius, contrast, focus, and interactive-state guidance unless a documented approval changes them
- Keep logo geometry independent from component CSS while mapping presentation to approved token roles

## Concept review template

For each future direction, document in English:

- rationale marked as hypothesis where it is interpretive
- composition and clear-space rule
- typography and exact Design System tokens
- palette with source token and value
- horizontal, compact, and monochrome behavior
- use cases and minimum-size test plan
- risks, ambiguity, and unresolved dependencies

## Approval criteria

A direction is ready for approval only when:

- the name and byline are verified against the official brief
- no unsupported brand or performance claim is encoded in the rationale or symbol
- the proposal includes the three required variants and a monochrome fallback
- every non-base token has an owner, rationale, and explicit approval request
- contrast is measured on every intended background
- SVG, if produced, is parseable, text is legible at the stated minimum size, and the file is marked draft until approval
- the project folder contains documentation and no changes to `_base/Nocturne/`
- the named decision owner approves the direction at the designated gate

## Blockers before work starts

- Official names are missing for all three projects
- Personas and positioning are missing for all three projects
- No project-specific palette or typography adaptation is authorized
- No logo should be generated from placeholder data
