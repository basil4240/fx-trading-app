/* eslint-disable @typescript-eslint/only-throw-error */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Logger } from '@nestjs/common';

/**
 * Abstract base class for local storage/cache implementations
 * Provides a common interface for Redis, Valkey, and NestJS Cache Manager
 */
export abstract class LocalStorageService {
  protected abstract readonly logger: Logger;
  protected abstract readonly defaultTTL: number; // in seconds

  // ============================================================================
  // CORE CACHE OPERATIONS
  // ============================================================================

  /**
   * Get a value from cache
   */
  abstract get<T = any>(key: string): Promise<T | null>;

  /**
   * Set a value in cache with optional TTL
   */
  abstract set<T = any>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Delete a key from cache
   */
  abstract del(key: string): Promise<boolean>;

  /**
   * Check if a key exists
   */
  abstract exists(key: string): Promise<boolean>;

  /**
   * Set expiration time for a key (in seconds)
   */
  abstract expire(key: string, ttl: number): Promise<boolean>;

  /**
   * Get remaining TTL for a key (in seconds, -1 if no expiry, -2 if not exists)
   */
  abstract ttl(key: string): Promise<number>;

  /**
   * Remove expiration from a key
   */
  abstract persist(key: string): Promise<boolean>;

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  /**
   * Get multiple values at once
   */
  abstract mget<T = any>(keys: string[]): Promise<(T | null)[]>;

  /**
   * Set multiple key-value pairs at once
   */
  abstract mset<T = any>(
    entries: Array<{ key: string; value: T; ttl?: number }>,
  ): Promise<void>;

  /**
   * Delete multiple keys at once
   */
  abstract mdel(keys: string[]): Promise<number>;

  // ============================================================================
  // PATTERN OPERATIONS
  // ============================================================================

  /**
   * Find keys matching a pattern
   */
  abstract keys(pattern: string): Promise<string[]>;

  /**
   * Delete all keys matching a pattern
   */
  abstract deletePattern(pattern: string): Promise<number>;

  /**
   * Get all keys with their values matching a pattern
   */
  abstract getByPattern<T = any>(
    pattern: string,
  ): Promise<Array<{ key: string; value: T }>>;

  // ============================================================================
  // HASH OPERATIONS
  // ============================================================================

  /**
   * Set a field in a hash
   */
  abstract hset(key: string, field: string, value: any): Promise<void>;

  /**
   * Get a field from a hash
   */
  abstract hget<T = any>(key: string, field: string): Promise<T | null>;

  /**
   * Get all fields and values in a hash
   */
  abstract hgetall<T = any>(key: string): Promise<Record<string, T>>;

  /**
   * Delete a field from a hash
   */
  abstract hdel(key: string, field: string): Promise<boolean>;

  /**
   * Check if a field exists in a hash
   */
  abstract hexists(key: string, field: string): Promise<boolean>;

  /**
   * Get all field names in a hash
   */
  abstract hkeys(key: string): Promise<string[]>;

  /**
   * Set multiple fields in a hash
   */
  abstract hmset(key: string, data: Record<string, any>): Promise<void>;

  // ============================================================================
  // LIST OPERATIONS
  // ============================================================================

  /**
   * Push value(s) to the left of a list
   */
  abstract lpush<T = any>(key: string, ...values: T[]): Promise<number>;

  /**
   * Push value(s) to the right of a list
   */
  abstract rpush<T = any>(key: string, ...values: T[]): Promise<number>;

  /**
   * Pop a value from the left of a list
   */
  abstract lpop<T = any>(key: string): Promise<T | null>;

  /**
   * Pop a value from the right of a list
   */
  abstract rpop<T = any>(key: string): Promise<T | null>;

  /**
   * Get a range of elements from a list
   */
  abstract lrange<T = any>(
    key: string,
    start: number,
    stop: number,
  ): Promise<T[]>;

  /**
   * Get the length of a list
   */
  abstract llen(key: string): Promise<number>;

  /**
   * Remove elements from a list
   */
  abstract lrem<T = any>(key: string, count: number, value: T): Promise<number>;

  // ============================================================================
  // SET OPERATIONS
  // ============================================================================

  /**
   * Add member(s) to a set
   */
  abstract sadd<T = any>(key: string, ...members: T[]): Promise<number>;

  /**
   * Remove member(s) from a set
   */
  abstract srem<T = any>(key: string, ...members: T[]): Promise<number>;

  /**
   * Get all members of a set
   */
  abstract smembers<T = any>(key: string): Promise<T[]>;

  /**
   * Check if a member exists in a set
   */
  abstract sismember<T = any>(key: string, member: T): Promise<boolean>;

  /**
   * Get the number of members in a set
   */
  abstract scard(key: string): Promise<number>;

  // ============================================================================
  // SORTED SET OPERATIONS
  // ============================================================================

  /**
   * Add member(s) to a sorted set with scores
   */
  abstract zadd(
    key: string,
    ...members: Array<{ score: number; value: any }>
  ): Promise<number>;

  /**
   * Get members in a sorted set by score range
   */
  abstract zrangebyscore<T = any>(
    key: string,
    min: number,
    max: number,
  ): Promise<T[]>;

  /**
   * Get members in a sorted set by rank range
   */
  abstract zrange<T = any>(
    key: string,
    start: number,
    stop: number,
  ): Promise<T[]>;

  /**
   * Remove member(s) from a sorted set
   */
  abstract zrem<T = any>(key: string, ...members: T[]): Promise<number>;

  /**
   * Get the score of a member in a sorted set
   */
  abstract zscore(key: string, member: any): Promise<number | null>;

  /**
   * Get the rank of a member in a sorted set
   */
  abstract zrank(key: string, member: any): Promise<number | null>;

  // ============================================================================
  // ATOMIC OPERATIONS
  // ============================================================================

  /**
   * Increment a numeric value
   */
  abstract incr(key: string): Promise<number>;

  /**
   * Increment a numeric value by a specific amount
   */
  abstract incrby(key: string, increment: number): Promise<number>;

  /**
   * Decrement a numeric value
   */
  abstract decr(key: string): Promise<number>;

  /**
   * Decrement a numeric value by a specific amount
   */
  abstract decrby(key: string, decrement: number): Promise<number>;

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Get or set a value (retrieve from cache or compute and cache)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Wrap a function with caching based on arguments
   */
  async wrap<T>(
    keyPrefix: string,
    args: any[],
    factory: (...args: any[]) => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const key = this.buildKey(keyPrefix, ...args);
    return this.getOrSet(key, () => factory(...args), ttl);
  }

  /**
   * Build a cache key from parts
   */
  protected buildKey(...parts: any[]): string {
    return parts
      .map((part) =>
        typeof part === 'object' ? JSON.stringify(part) : String(part),
      )
      .join(':');
  }

  /**
   * Serialize value for storage
   */
  protected serialize<T>(value: T): string {
    return JSON.stringify(value);
  }

  /**
   * Deserialize value from storage
   */
  protected deserialize<T>(value: string): T {
    try {
      return JSON.parse(value);
    } catch {
      return value as any;
    }
  }

  /**
   * Clear all cache entries (use with caution)
   */
  abstract clear(): Promise<void>;

  /**
   * Get cache statistics
   */
  abstract getStats(): Promise<{
    hits?: number;
    misses?: number;
    keys?: number;
    memory?: number;
  }>;

  /**
   * Check if the cache service is healthy/connected
   */
  abstract isHealthy(): Promise<boolean>;

  /**
   * Set value only if key doesn't exist (SET NX)
   */
  abstract setnx<T = any>(
    key: string,
    value: T,
    ttl?: number,
  ): Promise<boolean>;

  /**
   * Get and delete a key atomically
   */
  abstract getdel<T = any>(key: string): Promise<T | null>;

  /**
   * Rename a key
   */
  abstract rename(oldKey: string, newKey: string): Promise<boolean>;

  /**
   * Get cache size/count
   */
  abstract size(): Promise<number>;

  /**
   * Batch get with default values
   */
  async mgetWithDefaults<T>(keys: string[], defaultValue: T): Promise<T[]> {
    const results = await this.mget<T>(keys);
    return results.map((value) => (value === null ? defaultValue : value));
  }

  /**
   * Set with retry logic
   */
  async setWithRetry<T>(
    key: string,
    value: T,
    ttl?: number,
    maxRetries = 3,
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await this.set(key, value, ttl);
        return;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `Cache set retry ${attempt + 1}/${maxRetries} for key: ${key}`,
        );
        await this.sleep(Math.pow(2, attempt) * 100);
      }
    }

    throw lastError;
  }

  /**
   * Increment with expiry
   */
  async incrWithExpiry(
    key: string,
    increment: number,
    ttl: number,
  ): Promise<number> {
    const value = await this.incrby(key, increment);
    await this.expire(key, ttl);
    return value;
  }

  /**
   * Rate limiter helper
   */
  async checkRateLimit(
    identifier: string,
    limit: number,
    windowSeconds: number,
  ): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    const key = this.buildKey('ratelimit', identifier);
    const current = await this.incr(key);

    if (current === 1) {
      await this.expire(key, windowSeconds);
    }

    const ttl = await this.ttl(key);
    const resetAt = new Date(Date.now() + ttl * 1000);
    const allowed = current <= limit;
    const remaining = Math.max(0, limit - current);

    return { allowed, remaining, resetAt };
  }

  /**
   * Cache tags helper - tag a key for group invalidation
   */
  async tagKey(key: string, tags: string[]): Promise<void> {
    const tagPromises = tags.map((tag) =>
      this.sadd(this.buildKey('tag', tag), key),
    );
    await Promise.all(tagPromises);
  }

  /**
   * Invalidate all keys with a specific tag
   */
  async invalidateTag(tag: string): Promise<number> {
    const tagKey = this.buildKey('tag', tag);
    const keys = await this.smembers<string>(tagKey);

    if (keys.length === 0) return 0;

    const deleted = await this.mdel(keys);
    await this.del(tagKey);

    return deleted;
  }

  /**
   * Lock helper for distributed locking
   */
  async acquireLock(
    resource: string,
    ttl: number,
    identifier: string = this.generateId(),
  ): Promise<string | null> {
    const lockKey = this.buildKey('lock', resource);
    const acquired = await this.setnx(lockKey, identifier, ttl);
    return acquired ? identifier : null;
  }

  /**
   * Release lock
   */
  async releaseLock(resource: string, identifier: string): Promise<boolean> {
    const lockKey = this.buildKey('lock', resource);
    const current = await this.get<string>(lockKey);

    if (current === identifier) {
      return await this.del(lockKey);
    }

    return false;
  }

  /**
   * Execute with lock
   */
  async withLock<T>(
    resource: string,
    ttl: number,
    fn: () => Promise<T>,
  ): Promise<T> {
    const identifier = this.generateId();
    const acquired = await this.acquireLock(resource, ttl, identifier);

    if (!acquired) {
      throw new Error(`Failed to acquire lock for resource: ${resource}`);
    }

    try {
      return await fn();
    } finally {
      await this.releaseLock(resource, identifier);
    }
  }

  /**
   * Generate unique identifier
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep utility
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Namespace helper for key prefixing
   */
  protected namespaced(namespace: string, key: string): string {
    return this.buildKey(namespace, key);
  }
}
