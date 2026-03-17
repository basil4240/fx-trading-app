import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { LocalStorageService } from '../local-storage.service';
import type { ConfigType } from '@nestjs/config';
import redisConfig from 'src/common/config/redis.config';

@Injectable()
export class RedisService
  extends LocalStorageService
  implements OnModuleDestroy
{
  protected readonly logger = new Logger(RedisService.name);
  protected readonly defaultTTL: number;
  private readonly client: Redis;
  private readonly keyPrefix: string;

  constructor(
    @Inject(redisConfig.KEY)
    private readonly redisConfiguration: ConfigType<typeof redisConfig>,
  ) {
    super();

    this.defaultTTL = 3600;
    this.keyPrefix = '';

    this.client = new Redis({
      host: redisConfiguration.host,
      port: redisConfiguration.port,
      // password: 'config.password',
      // db: 0,
      retryStrategy: (times) => {
        if (times > 12) {
          this.logger.error('Redis connection failed after 12 retries');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: false,
      lazyConnect: false,
    });

    this.client.on('connect', () => {
      this.logger.log('Redis client connected');
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis client error:', err);
    });

    this.client.on('ready', () => {
      this.logger.log('Redis client ready');
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis client disconnected');
  }

  private prefixKey(key: string): string {
    return this.keyPrefix ? `${this.keyPrefix}${key}` : key;
  }

  private unprefixKey(key: string): string {
    return this.keyPrefix && key.startsWith(this.keyPrefix)
      ? key.slice(this.keyPrefix.length)
      : key;
  }

  // ============================================================================
  // CORE CACHE OPERATIONS
  // ============================================================================

  async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(this.prefixKey(key));
      return value ? this.deserialize<T>(value) : null;
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      throw error;
    }
  }

  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const serialized = this.serialize(value);
      const finalTTL = ttl ?? this.defaultTTL;

      if (finalTTL > 0) {
        await this.client.setex(this.prefixKey(key), finalTTL, serialized);
      } else {
        await this.client.set(this.prefixKey(key), serialized);
      }
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(this.prefixKey(key));
      return result > 0;
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(this.prefixKey(key));
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}:`, error);
      throw error;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.client.expire(this.prefixKey(key), ttl);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error setting expiration for key ${key}:`, error);
      throw error;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(this.prefixKey(key));
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}:`, error);
      throw error;
    }
  }

  async persist(key: string): Promise<boolean> {
    try {
      const result = await this.client.persist(this.prefixKey(key));
      return result === 1;
    } catch (error) {
      this.logger.error(`Error persisting key ${key}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
    try {
      if (keys.length === 0) return [];

      const prefixedKeys = keys.map((k) => this.prefixKey(k));
      const values = await this.client.mget(...prefixedKeys);

      return values.map((v) => (v ? this.deserialize<T>(v) : null));
    } catch (error) {
      this.logger.error('Error in mget:', error);
      throw error;
    }
  }

  async mset<T = any>(
    entries: Array<{ key: string; value: T; ttl?: number }>,
  ): Promise<void> {
    try {
      if (entries.length === 0) return;

      const pipeline = this.client.pipeline();

      for (const entry of entries) {
        const serialized = this.serialize(entry.value);
        const finalTTL = entry.ttl ?? this.defaultTTL;

        if (finalTTL > 0) {
          pipeline.setex(this.prefixKey(entry.key), finalTTL, serialized);
        } else {
          pipeline.set(this.prefixKey(entry.key), serialized);
        }
      }

      await pipeline.exec();
    } catch (error) {
      this.logger.error('Error in mset:', error);
      throw error;
    }
  }

  async mdel(keys: string[]): Promise<number> {
    try {
      if (keys.length === 0) return 0;

      const prefixedKeys = keys.map((k) => this.prefixKey(k));
      return await this.client.del(...prefixedKeys);
    } catch (error) {
      this.logger.error('Error in mdel:', error);
      throw error;
    }
  }

  // ============================================================================
  // PATTERN OPERATIONS
  // ============================================================================

  async keys(pattern: string): Promise<string[]> {
    try {
      const prefixedPattern = this.prefixKey(pattern);
      const keys = await this.client.keys(prefixedPattern);
      return keys.map((k) => this.unprefixKey(k));
    } catch (error) {
      this.logger.error(`Error getting keys with pattern ${pattern}:`, error);
      throw error;
    }
  }

  async deletePattern(pattern: string): Promise<number> {
    try {
      const keys = await this.keys(pattern);
      return keys.length > 0 ? await this.mdel(keys) : 0;
    } catch (error) {
      this.logger.error(`Error deleting pattern ${pattern}:`, error);
      throw error;
    }
  }

  async getByPattern<T = any>(
    pattern: string,
  ): Promise<Array<{ key: string; value: T }>> {
    try {
      const keys = await this.keys(pattern);
      if (keys.length === 0) return [];

      const values = await this.mget<T>(keys);

      return keys
        .map((key, index) => ({
          key,
          value: values[index],
        }))
        .filter((item) => item.value !== null) as Array<{
        key: string;
        value: T;
      }>;
    } catch (error) {
      this.logger.error(`Error getting by pattern ${pattern}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // HASH OPERATIONS
  // ============================================================================

  async hset(key: string, field: string, value: any): Promise<void> {
    try {
      const serialized = this.serialize(value);
      await this.client.hset(this.prefixKey(key), field, serialized);
    } catch (error) {
      this.logger.error(`Error in hset for key ${key}, field ${field}:`, error);
      throw error;
    }
  }

  async hget<T = any>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.client.hget(this.prefixKey(key), field);
      return value ? this.deserialize<T>(value) : null;
    } catch (error) {
      this.logger.error(`Error in hget for key ${key}, field ${field}:`, error);
      throw error;
    }
  }

  async hgetall<T = any>(key: string): Promise<Record<string, T>> {
    try {
      const hash = await this.client.hgetall(this.prefixKey(key));
      const result: Record<string, T> = {};

      for (const [field, value] of Object.entries(hash)) {
        result[field] = this.deserialize<T>(value);
      }

      return result;
    } catch (error) {
      this.logger.error(`Error in hgetall for key ${key}:`, error);
      throw error;
    }
  }

  async hdel(key: string, field: string): Promise<boolean> {
    try {
      const result = await this.client.hdel(this.prefixKey(key), field);
      return result > 0;
    } catch (error) {
      this.logger.error(`Error in hdel for key ${key}, field ${field}:`, error);
      throw error;
    }
  }

  async hexists(key: string, field: string): Promise<boolean> {
    try {
      const result = await this.client.hexists(this.prefixKey(key), field);
      return result === 1;
    } catch (error) {
      this.logger.error(
        `Error in hexists for key ${key}, field ${field}:`,
        error,
      );
      throw error;
    }
  }

  async hkeys(key: string): Promise<string[]> {
    try {
      return await this.client.hkeys(this.prefixKey(key));
    } catch (error) {
      this.logger.error(`Error in hkeys for key ${key}:`, error);
      throw error;
    }
  }

  async hmset(key: string, data: Record<string, any>): Promise<void> {
    try {
      const serializedData: Record<string, string> = {};

      for (const [field, value] of Object.entries(data)) {
        serializedData[field] = this.serialize(value);
      }

      await this.client.hmset(this.prefixKey(key), serializedData);
    } catch (error) {
      this.logger.error(`Error in hmset for key ${key}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // LIST OPERATIONS
  // ============================================================================

  async lpush<T = any>(key: string, ...values: T[]): Promise<number> {
    try {
      const serialized = values.map((v) => this.serialize(v));
      return await this.client.lpush(this.prefixKey(key), ...serialized);
    } catch (error) {
      this.logger.error(`Error in lpush for key ${key}:`, error);
      throw error;
    }
  }

  async rpush<T = any>(key: string, ...values: T[]): Promise<number> {
    try {
      const serialized = values.map((v) => this.serialize(v));
      return await this.client.rpush(this.prefixKey(key), ...serialized);
    } catch (error) {
      this.logger.error(`Error in rpush for key ${key}:`, error);
      throw error;
    }
  }

  async lpop<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.client.lpop(this.prefixKey(key));
      return value ? this.deserialize<T>(value) : null;
    } catch (error) {
      this.logger.error(`Error in lpop for key ${key}:`, error);
      throw error;
    }
  }

  async rpop<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.client.rpop(this.prefixKey(key));
      return value ? this.deserialize<T>(value) : null;
    } catch (error) {
      this.logger.error(`Error in rpop for key ${key}:`, error);
      throw error;
    }
  }

  async lrange<T = any>(
    key: string,
    start: number,
    stop: number,
  ): Promise<T[]> {
    try {
      const values = await this.client.lrange(this.prefixKey(key), start, stop);
      return values.map((v) => this.deserialize<T>(v));
    } catch (error) {
      this.logger.error(`Error in lrange for key ${key}:`, error);
      throw error;
    }
  }

  async llen(key: string): Promise<number> {
    try {
      return await this.client.llen(this.prefixKey(key));
    } catch (error) {
      this.logger.error(`Error in llen for key ${key}:`, error);
      throw error;
    }
  }

  async lrem<T = any>(key: string, count: number, value: T): Promise<number> {
    try {
      const serialized = this.serialize(value);
      return await this.client.lrem(this.prefixKey(key), count, serialized);
    } catch (error) {
      this.logger.error(`Error in lrem for key ${key}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // SET OPERATIONS
  // ============================================================================

  async sadd<T = any>(key: string, ...members: T[]): Promise<number> {
    try {
      const serialized = members.map((m) => this.serialize(m));
      return await this.client.sadd(this.prefixKey(key), ...serialized);
    } catch (error) {
      this.logger.error(`Error in sadd for key ${key}:`, error);
      throw error;
    }
  }

  async srem<T = any>(key: string, ...members: T[]): Promise<number> {
    try {
      const serialized = members.map((m) => this.serialize(m));
      return await this.client.srem(this.prefixKey(key), ...serialized);
    } catch (error) {
      this.logger.error(`Error in srem for key ${key}:`, error);
      throw error;
    }
  }

  async smembers<T = any>(key: string): Promise<T[]> {
    try {
      const members = await this.client.smembers(this.prefixKey(key));
      return members.map((m) => this.deserialize<T>(m));
    } catch (error) {
      this.logger.error(`Error in smembers for key ${key}:`, error);
      throw error;
    }
  }

  async sismember<T = any>(key: string, member: T): Promise<boolean> {
    try {
      const serialized = this.serialize(member);
      const result = await this.client.sismember(
        this.prefixKey(key),
        serialized,
      );
      return result === 1;
    } catch (error) {
      this.logger.error(`Error in sismember for key ${key}:`, error);
      throw error;
    }
  }

  async scard(key: string): Promise<number> {
    try {
      return await this.client.scard(this.prefixKey(key));
    } catch (error) {
      this.logger.error(`Error in scard for key ${key}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // SORTED SET OPERATIONS
  // ============================================================================

  async zadd(
    key: string,
    ...members: Array<{ score: number; value: any }>
  ): Promise<number> {
    try {
      const args: Array<number | string> = [];

      for (const member of members) {
        args.push(member.score, this.serialize(member.value));
      }

      return await this.client.zadd(this.prefixKey(key), ...args);
    } catch (error) {
      this.logger.error(`Error in zadd for key ${key}:`, error);
      throw error;
    }
  }

  async zrangebyscore<T = any>(
    key: string,
    min: number,
    max: number,
  ): Promise<T[]> {
    try {
      const values = await this.client.zrangebyscore(
        this.prefixKey(key),
        min,
        max,
      );
      return values.map((v) => this.deserialize<T>(v));
    } catch (error) {
      this.logger.error(`Error in zrangebyscore for key ${key}:`, error);
      throw error;
    }
  }

  async zrange<T = any>(
    key: string,
    start: number,
    stop: number,
  ): Promise<T[]> {
    try {
      const values = await this.client.zrange(this.prefixKey(key), start, stop);
      return values.map((v) => this.deserialize<T>(v));
    } catch (error) {
      this.logger.error(`Error in zrange for key ${key}:`, error);
      throw error;
    }
  }

  async zrem<T = any>(key: string, ...members: T[]): Promise<number> {
    try {
      const serialized = members.map((m) => this.serialize(m));
      return await this.client.zrem(this.prefixKey(key), ...serialized);
    } catch (error) {
      this.logger.error(`Error in zrem for key ${key}:`, error);
      throw error;
    }
  }

  async zscore(key: string, member: any): Promise<number | null> {
    try {
      const serialized = this.serialize(member);
      const score = await this.client.zscore(this.prefixKey(key), serialized);
      return score ? parseFloat(score) : null;
    } catch (error) {
      this.logger.error(`Error in zscore for key ${key}:`, error);
      throw error;
    }
  }

  async zrank(key: string, member: any): Promise<number | null> {
    try {
      const serialized = this.serialize(member);
      const rank = await this.client.zrank(this.prefixKey(key), serialized);
      return rank !== null ? rank : null;
    } catch (error) {
      this.logger.error(`Error in zrank for key ${key}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // ATOMIC OPERATIONS
  // ============================================================================

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(this.prefixKey(key));
    } catch (error) {
      this.logger.error(`Error in incr for key ${key}:`, error);
      throw error;
    }
  }

  async incrby(key: string, increment: number): Promise<number> {
    try {
      return await this.client.incrby(this.prefixKey(key), increment);
    } catch (error) {
      this.logger.error(`Error in incrby for key ${key}:`, error);
      throw error;
    }
  }

  async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(this.prefixKey(key));
    } catch (error) {
      this.logger.error(`Error in decr for key ${key}:`, error);
      throw error;
    }
  }

  async decrby(key: string, decrement: number): Promise<number> {
    try {
      return await this.client.decrby(this.prefixKey(key), decrement);
    } catch (error) {
      this.logger.error(`Error in decrby for key ${key}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  async clear(): Promise<void> {
    try {
      await this.client.flushdb();
      this.logger.log('Cache cleared');
    } catch (error) {
      this.logger.error('Error clearing cache:', error);
      throw error;
    }
  }

  async getStats(): Promise<{
    hits?: number;
    misses?: number;
    keys?: number;
    memory?: number;
  }> {
    try {
      const info = await this.client.info('stats');
      const dbsize = await this.client.dbsize();
      const memory = await this.client.info('memory');

      const parseInfo = (infoStr: string, key: string): number => {
        const match = infoStr.match(new RegExp(`${key}:(\\d+)`));
        return match ? parseInt(match[1], 10) : 0;
      };

      return {
        hits: parseInfo(info, 'keyspace_hits'),
        misses: parseInfo(info, 'keyspace_misses'),
        keys: dbsize,
        memory: parseInfo(memory, 'used_memory'),
      };
    } catch (error) {
      this.logger.error('Error getting stats:', error);
      throw error;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return false;
    }
  }

  async setnx<T = any>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const serialized = this.serialize(value);
      const finalTTL = ttl ?? this.defaultTTL;

      if (finalTTL > 0) {
        const result = await this.client.set(
          this.prefixKey(key),
          serialized,
          'EX',
          finalTTL,
          'NX',
        );
        return result === 'OK';
      } else {
        const result = await this.client.setnx(this.prefixKey(key), serialized);
        return result === 1;
      }
    } catch (error) {
      this.logger.error(`Error in setnx for key ${key}:`, error);
      throw error;
    }
  }

  async getdel<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this.client.getdel(this.prefixKey(key));
      return value ? this.deserialize<T>(value) : null;
    } catch (error) {
      this.logger.error(`Error in getdel for key ${key}:`, error);
      throw error;
    }
  }

  async rename(oldKey: string, newKey: string): Promise<boolean> {
    try {
      await this.client.rename(this.prefixKey(oldKey), this.prefixKey(newKey));
      return true;
    } catch (error) {
      this.logger.error(`Error renaming key ${oldKey} to ${newKey}:`, error);
      return false;
    }
  }

  async size(): Promise<number> {
    try {
      return await this.client.dbsize();
    } catch (error) {
      this.logger.error('Error getting cache size:', error);
      throw error;
    }
  }

  /**
   * Get the underlying Redis client for advanced operations
   */
  getClient(): Redis {
    return this.client;
  }

}
