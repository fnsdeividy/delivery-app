import Redis from 'ioredis'

let redisClient: Redis | null = null

export function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) return null
  if (redisClient) return redisClient
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableAutoPipelining: true,
    })
    return redisClient
  } catch (error) {
    console.warn('Redis desabilitado: falha ao inicializar cliente', error)
    return null
  }
}

export async function redisGet<T = unknown>(key: string): Promise<T | null> {
  const client = getRedisClient()
  if (!client) return null
  try {
    if (client.status !== 'ready') {
      await client.connect()
    }
    const value = await client.get(key)
    return value ? (JSON.parse(value) as T) : null
  } catch {
    return null
  }
}

export async function redisSet(
  key: string,
  value: unknown,
  ttlSeconds = 60
): Promise<void> {
  const client = getRedisClient()
  if (!client) return
  try {
    if (client.status !== 'ready') {
      await client.connect()
    }
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch {
    /* noop */
  }
}

