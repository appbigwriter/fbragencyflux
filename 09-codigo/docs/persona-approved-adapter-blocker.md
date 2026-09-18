# Persona approved adapter boundary blocker

## Scope

The local Flux slice accepts the approved-event envelope, persists an inbox claim keyed by `event_id + consumer`, and creates deterministic local provisioning job and handoff records. It performs no Authority, Blogs, Control Tower, remote Supabase, deployment, DNS, publication, or secret operation.

## Blocker

A versioned Authority/Blogs adapter contract is not available in this repository. The local boundary therefore fails closed with `AUTHORITY_BLOGS_ADAPTER_CONTRACT_NOT_READY`. The job and handoff remain `blocked`, with sanitized error/readback state persisted.

## Required unblock input

- Typed request/response contract for provisioning the approved `persona_version_id` into `blog_id`.
- Authentication and timeout contract (not credentials).
- Explicit provisioning idempotency key semantics.
- Readback response proving the consumed persona version, blog binding, and resulting state.
- Local fake adapter fixture that returns a verified readback for tests.

## Owner and next action

Owner: Théo / coordinator of the Authority–Blogs integration.

Next action: publish the versioned adapter contract and fake readback fixture, then run the targeted `persona-approved` tests. No external call is authorized by this artifact.
