// Short-TTL read cache for availability lookups.
//
// The spec calls for Redis; this is the same contract behind a swappable
// interface, backed by a process-local Map. Swap the implementation for
// Redis/Upstash when the app runs on more than one instance — the TTL is
// deliberately short (30s) so a stale entry can never outlive a sync cycle.

const DEFAULT_TTL_MS = Number(process.env.BOOKING_CACHE_TTL_MS ?? 30_000);

interface Entry<T> {
  value: T;
  expiresAt: number;
}

const entries = new Map<string, Entry<unknown>>();

export function cacheGet<T>(key: string): T | null {
  const hit = entries.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    entries.delete(key);
    return null;
  }
  return hit.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): T {
  entries.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

/** Drops every cached entry for a property. Called after any calendar write. */
export function invalidateProperty(propertyId: string) {
  for (const key of entries.keys()) {
    if (key.includes(propertyId)) entries.delete(key);
  }
}

export function cacheClear() {
  entries.clear();
}

export async function cached<T>(
  key: string,
  ttlMs: number,
  produce: () => Promise<T>
): Promise<T> {
  const hit = cacheGet<T>(key);
  if (hit !== null) return hit;
  return cacheSet(key, await produce(), ttlMs);
}
