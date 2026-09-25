import { createHash } from 'node:crypto'
import { readFile, rename, writeFile } from 'node:fs/promises'

async function bytes(file: string) { return readFile(file) }
export async function snapshotDigest(file: string) { return createHash('sha256').update(await bytes(file)).digest('hex') }
export async function createBackup(source: string, destination: string) {
  const data = await bytes(source); await writeFile(destination, data); return { source, destination, digest: createHash('sha256').update(data).digest('hex'), createdAt: new Date().toISOString(), size: data.byteLength }
}
export async function restoreBackup(backup: string, destination: string) {
  const data = await bytes(backup); const temporary = `${destination}.${process.pid}.tmp`; await writeFile(temporary, data); await rename(temporary, destination); return { destination, digest: createHash('sha256').update(data).digest('hex'), restoredAt: new Date().toISOString() }
}
