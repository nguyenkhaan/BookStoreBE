import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { REDIS_REQUEST_LIMIT } from '@/bases/commons/constants/redis.constant';
@Injectable()
export class RedisService {
	constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
	async get<T>(key: string) {
		return await this.cacheManager.get<T>(key);
	}
	async set(key: string, value: any, ttl?: number) {
		if (!ttl) await this.cacheManager.set(key, value);
		else await this.cacheManager.set(key, value, ttl);
	}
	async incr(key: string, ttl?: number): Promise<number> {
		const nu = await this.cacheManager.get<number>(key);
		if (nu === undefined || nu === null) {
			if (ttl) await this.cacheManager.set(key, 1, ttl);
			else await this.cacheManager.set(key, 1);
			return 1;
		}
		const next = Math.min(REDIS_REQUEST_LIMIT, nu + 1);
		if (ttl) await this.cacheManager.set(key, next, ttl);
		else await this.cacheManager.set(key, next);
		return next;
	}
	async exists(key: string): Promise<boolean> {
		const ex = await this.cacheManager.get(key);
		if (ex === undefined || ex === null) return false;
		return true;
	}
	async del(key: string) {
		await this.cacheManager.del(key);
	}
}
