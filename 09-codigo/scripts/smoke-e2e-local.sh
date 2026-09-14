#!/usr/bin/env bash
set -euo pipefail
IMAGE="${FLUX_SMOKE_IMAGE:-fbr-agency-flux:smoke}"
NAME="${FLUX_SMOKE_CONTAINER:-fbr-agency-flux-smoke}"
PORT="${FLUX_SMOKE_PORT:-3137}"
ACTOR="Sergio"
SECRET="local-smoke-secret-change-me"
BASE="http://127.0.0.1:${PORT}"
COOKIE="${PWD}/.flux-smoke-cookie.$$"
PAGE="${PWD}/.flux-smoke-page.$$"
LOG="${PWD}/.flux-smoke-log.$$"
# Native Windows curl accepts drive-letter paths in slash form from Git Bash
CURL_COOKIE="$(cygpath -m "$COOKIE" 2>/dev/null || printf '%s' "$COOKIE")"
CURL_PAGE="$(cygpath -m "$PAGE" 2>/dev/null || printf '%s' "$PAGE")"
CURL_LOG="$(cygpath -m "$LOG" 2>/dev/null || printf '%s' "$LOG")"
cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; rm -f "$COOKIE" "$PAGE" "$LOG"; }
trap cleanup EXIT

docker build -t "$IMAGE" . >/dev/null
docker run -d --name "$NAME" -p "${PORT}:3000" \
  -e NODE_ENV=production -e FLUX_LOCAL_MODE=1 -e FLUX_PERSISTENCE=json \
  -e FLUX_LOCAL_LOGIN_ACTOR="$ACTOR" -e FLUX_LOCAL_LOGIN_SECRET="$SECRET" "$IMAGE" >/dev/null
snapshot_code=""
for _ in $(seq 1 30); do snapshot_code=$(curl -sS "$BASE/api/flux/snapshot" -o "$CURL_PAGE" -w '%{http_code}' 2>/dev/null || true); [ "$snapshot_code" = 200 ] && break; sleep 1; done
[ "$snapshot_code" = 200 ] || { echo "snapshot readiness failed HTTP=$snapshot_code" >&2; exit 1; }
login_code=$(curl -sS -c "$CURL_COOKIE" -H 'content-type: application/json' -d "{\"actor\":\"$ACTOR\",\"secret\":\"$SECRET\"}" -o "$CURL_PAGE" -w '%{http_code}' "$BASE/api/auth/login")
[ "$login_code" = 200 ] || { echo "login failed HTTP=$login_code" >&2; exit 1; }
approval_code=$(curl -sS -b "$CURL_COOKIE" -H 'content-type: application/json' -d '{"decision":"approved"}' -o "$CURL_PAGE" -w '%{http_code}' "$BASE/api/flux/approvals/approval-af-001/decision")
[ "$approval_code" = 200 ] || { echo "approval failed HTTP=$approval_code" >&2; exit 1; }
curl -fsS -b "$CURL_COOKIE" -H 'content-type: application/json' -d '{"cardId":"AF-001","project":"After Forty","from":"Sergio","to":"Kora","summary":"smoke handoff","done":"local","risks":"none","nextStep":"readback","acceptanceCriteria":"API readback","evidenceRef":"local-smoke"}' -o "$CURL_PAGE" "$BASE/api/flux/handoffs"
curl -fsS "$BASE/api/flux/snapshot" > "$PAGE"
grep -q 'smoke handoff' "$PAGE"
docker restart "$NAME" >/dev/null
for _ in $(seq 1 30); do curl -fsS "$BASE/api/flux/snapshot" > "$PAGE" 2>/dev/null && break; sleep 1; done
grep -q 'smoke handoff' "$PAGE"
if grep -Fq "$SECRET" "$PAGE"; then echo 'secret found in frontend response' >&2; exit 1; fi
docker logs "$NAME" > "$LOG" 2>&1
if grep -Fq "$SECRET" "$LOG"; then echo 'secret found in container logs' >&2; exit 1; fi
printf '%s\n' 'SMOKE_OK login approval handoff readback-after-restart no-secret-leak'
