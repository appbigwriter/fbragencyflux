# SharpEye — Deployment & Domain Verification (Proposal)

Status: PROPOSAL — no deployment or DNS mutation executed.

Release sequence:

1. Approve design/persona/legal artifacts.
2. Validate local typecheck, lint, tests, build, accessibility and metadata.
3. Provision runtime with secrets by reference only.
4. Configure domain and TLS through the authorized provider.
5. Run health, browser smoke, sitemap, canonical, schema and readback checks.
6. Confirm rollback path and receipt commit/version.
7. Publish only after Sergio’s explicit Gate.

Production acceptance requires a real URL, status/readback evidence, no critical QA findings, verified disclosures, and a recorded rollback reference.
