# Database integration handoff

The questionnaire selected Supabase/PostgreSQL, but no runtime contract or environment references are present in this workspace yet.

Required before wiring production reads:

- `NEXT_PUBLIC_SUPABASE_URL` reference;
- public/anon key reference stored by the runtime, never committed;
- project/schema owner and migration runner;
- approved execution of `supabase/001_game_style_articles.sql`;
- seed content contract for the initial ten articles;
- decision on whether reader authentication is actually required for a public editorial site.

Until those inputs exist, the site uses the verified development catalogue in `lib/content.ts`. It must not be presented as the production database integration.
