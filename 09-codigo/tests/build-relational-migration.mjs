import { relationalSpecs } from '../src/lib/relational-schema.ts'
import { writeFile } from 'node:fs/promises'
const sql = [`-- 004: relational runtime completion for 003; no data deletion/backfill and no snapshot storage.
-- JSONB exists ONLY as RPC transport/local variables, never as a persisted column.
-- Execute with a migration owner; RPC execute is restricted to service_role.
BEGIN;
CREATE TABLE IF NOT EXISTS flux_runtime_revision (id boolean PRIMARY KEY DEFAULT true CHECK(id), version bigint NOT NULL DEFAULT 0, coordinator_waiting_reasons text[]);
INSERT INTO flux_runtime_revision(id) VALUES(true) ON CONFLICT DO NOTHING;
ALTER TABLE flux_tenants ADD COLUMN IF NOT EXISTS external_id text UNIQUE;`]
const names = Object.values(relationalSpecs).map(x => x.table)
const extra = { flux_projects: ['slug'], flux_cards: ['acceptance_criteria'], flux_handoffs: ['tenant_id'], flux_artifacts: ['tenant_id','project_id'], flux_blockers: ['tenant_id','project_id','container_handoff_id'], flux_gates: ['tenant_id'], flux_events: ['tenant_id','project_id'], flux_receipts: ['tenant_id'], flux_coordinator_runs: ['tenant_id'], flux_required_actions: ['tenant_id','project_id'] }
for (const spec of Object.values(relationalSpecs)) {
  sql.push(`ALTER TABLE ${spec.table} ADD COLUMN IF NOT EXISTS external_id text UNIQUE;
ALTER TABLE ${spec.table} ADD COLUMN IF NOT EXISTS ordinal bigint;`)
  for (const f of Object.values(spec.fields)) {
    const ref = f.ref ? ` REFERENCES ${f.ref === 'tenants' ? 'flux_tenants' : relationalSpecs[f.ref].table}(id) ON DELETE RESTRICT` : ''
    sql.push(`ALTER TABLE ${spec.table} ADD COLUMN IF NOT EXISTS ${f.column} ${f.type}${ref};`)
    if (f.ref) sql.push(`ALTER TABLE ${spec.table} ADD COLUMN IF NOT EXISTS ${f.column}_external_ref text;`)
  }
}
sql.push(`ALTER TABLE flux_blockers ADD COLUMN IF NOT EXISTS container_handoff_id uuid REFERENCES flux_handoffs(id) ON DELETE RESTRICT;
-- Domain has no mandatory tenant/project on global coordinator/actions/events/receipts,
-- and partial legacy blocker input is explicitly representable (never fabricated).
ALTER TABLE flux_cards DROP CONSTRAINT IF EXISTS flux_cards_status_check;
ALTER TABLE flux_cards ADD CONSTRAINT flux_cards_status_check CHECK(status IN ('planned','ready','in_progress','review','blocked','awaiting_owner','awaiting_approval','approved','executing','verifying','completed','failed'));
ALTER TABLE flux_receipts DROP CONSTRAINT IF EXISTS flux_receipts_status_check;
ALTER TABLE flux_receipts ADD CONSTRAINT flux_receipts_status_check CHECK(status IN ('started','completed','failed','blocked','rejected'));
ALTER TABLE flux_artifacts ADD CONSTRAINT flux_artifact_content_exclusive CHECK(content_text IS NULL OR content_binary IS NULL);
`)
// Columns representing stricter future-domain requirements cannot invent values for current domain.
const nullable = { flux_sprints: ['tenant_id','next_check'], flux_stories: ['tenant_id','next_check'], flux_jobs: ['tenant_id','correlation_id'], flux_gates: ['tenant_id'], flux_required_actions: ['tenant_id','project_id','due_check','correlation_id'], flux_coordinator_runs: ['tenant_id','correlation_id'], flux_receipts: ['tenant_id','correlation_id','actor'], flux_events: ['project_id'], flux_blockers: ['tenant_id','project_id','owner','next_action','resolution_plan','status','resolution','verification_status'] }
for (const [t, cols] of Object.entries(nullable)) for (const c of cols) sql.push(`ALTER TABLE ${t} ALTER COLUMN ${c} DROP NOT NULL;`)
// Idempotent addition of content constraint.
sql[sql.length - Object.values(nullable).flat().length - 1] = sql[sql.length - Object.values(nullable).flat().length - 1].replace('ALTER TABLE flux_artifacts ADD CONSTRAINT flux_artifact_content_exclusive', 'ALTER TABLE flux_artifacts DROP CONSTRAINT IF EXISTS flux_artifact_content_exclusive;\nALTER TABLE flux_artifacts ADD CONSTRAINT flux_artifact_content_exclusive')
const whitelist = Object.values(relationalSpecs).map(s => `WHEN '${s.table}' THEN ARRAY[${[...new Set(['id','external_id','ordinal',...Object.values(s.fields).flatMap(f=>f.ref?[f.column,`${f.column}_external_ref`]:[f.column]),...(extra[s.table] || [])])].map(c=>`'${c}'`).join(',')}]::text[]`).join('\n')
const all = [...names,'flux_tenants']
sql.push(`CREATE OR REPLACE FUNCTION flux_relational_read() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE result jsonb; t text; items jsonb;
BEGIN
  SELECT jsonb_build_object('version',version,'waitingReasons',coordinator_waiting_reasons) INTO result FROM public.flux_runtime_revision WHERE id=true;
  FOREACH t IN ARRAY ARRAY[${all.map(t=>`'${t}'`).join(',')}] LOOP
    EXECUTE format('SELECT coalesce(jsonb_agg(to_jsonb(r)), ''[]''::jsonb) FROM public.%I r',t) INTO items;
    result := result || jsonb_build_object(t,items);
  END LOOP;
  RETURN result;
END $$;
CREATE OR REPLACE FUNCTION flux_relational_commit(expected_version bigint, changes jsonb, waiting_reasons text[] DEFAULT NULL) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE current_version bigint; item jsonb; t text; c text; allowed text[]; cols text; vals text; updates text;
BEGIN
  SELECT version INTO current_version FROM public.flux_runtime_revision WHERE id=true FOR UPDATE;
  IF expected_version IS DISTINCT FROM current_version THEN RAISE EXCEPTION 'PERSISTENCE_CONFLICT' USING ERRCODE='40001'; END IF;
  IF jsonb_typeof(changes) <> 'array' THEN RAISE EXCEPTION 'INVALID_RELATIONAL_CHANGES'; END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(changes) LOOP
    t := item->>'table';
    allowed := CASE t ${whitelist} ELSE NULL END;
    IF allowed IS NULL OR jsonb_typeof(item->'row') <> 'object' OR item->'row'->>'id' IS NULL THEN RAISE EXCEPTION 'INVALID_RELATIONAL_TABLE_OR_ROW'; END IF;
    cols := ''; vals := ''; updates := '';
    FOR c IN SELECT jsonb_object_keys(item->'row') LOOP
      IF NOT c=ANY(allowed) THEN RAISE EXCEPTION 'INVALID_RELATIONAL_COLUMN'; END IF;
      cols := cols || format('%I,',c); vals := vals || format('r.%I,',c);
      IF c <> 'id' THEN updates := updates || format('%I=EXCLUDED.%I,',c,c); END IF;
    END LOOP;
    IF item->>'operation' IS DISTINCT FROM 'upsert' THEN RAISE EXCEPTION 'DELETION_NOT_SUPPORTED'; END IF;
    EXECUTE format('INSERT INTO public.%I (%s) SELECT %s FROM jsonb_populate_record(NULL::public.%I,$1) r ON CONFLICT(id) DO UPDATE SET %s', t,rtrim(cols,','),rtrim(vals,','),t,rtrim(updates,',')) USING item->'row';
  END LOOP;
  UPDATE public.flux_runtime_revision SET version=version+1, coordinator_waiting_reasons=waiting_reasons WHERE id=true;
  RETURN public.flux_relational_read();
END $$;
REVOKE ALL ON FUNCTION flux_relational_read() FROM PUBLIC;
REVOKE ALL ON FUNCTION flux_relational_commit(bigint,jsonb,text[]) FROM PUBLIC;
DO $$ BEGIN IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN
  GRANT EXECUTE ON FUNCTION flux_relational_read() TO service_role;
  GRANT EXECUTE ON FUNCTION flux_relational_commit(bigint,jsonb,text[]) TO service_role;
END IF; END $$;`)
for (const t of [...all,'flux_runtime_revision']) sql.push(`ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY; ALTER TABLE ${t} NO FORCE ROW LEVEL SECURITY;`)
sql.push('COMMIT;')
await writeFile('../04-database/004_flux_relational_rpcs.sql',sql.join('\n')+'\n')
console.log('Generated canonical 004_flux_relational_rpcs.sql from explicit relational field contract')
