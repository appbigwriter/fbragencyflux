const secretKey = /token|secret|password|passwd|authorization|cookie|service[_-]?role|api[_-]?key/i
export type Receipt = { correlationId: string; operation: string; status: 'started' | 'completed' | 'failed' | 'blocked'; actor?: string; jobId?: string; startedAt: string; completedAt: string; durationMs: number; metadata?: Record<string, unknown> }
function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, secretKey.test(key) ? '[REDACTED]' : redact(item)]))
  return value
}
export function sanitizeError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return message.replace(/(bearer\s+|token[=:]\s*|secret[=:]\s*)[^\s,;]+/gi, '$1[REDACTED]')
}
export function createReceipt(input: { correlationId: string; operation: string; status: Receipt['status']; actor?: string; jobId?: string; startedAt?: string; completedAt?: string; metadata?: Record<string, unknown> }): Receipt {
  const startedAt = input.startedAt || new Date().toISOString(); const completedAt = input.completedAt || new Date().toISOString()
  return { correlationId: input.correlationId, operation: input.operation, status: input.status, actor: input.actor, jobId: input.jobId, startedAt, completedAt, durationMs: Math.max(0, Date.parse(completedAt) - Date.parse(startedAt)), metadata: input.metadata ? redact(input.metadata) as Record<string, unknown> : undefined }
}
