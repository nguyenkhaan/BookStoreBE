import { Injectable } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
@Injectable() 
export class RedisService 
{
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager : Cache 
    ) {} 
    async get<T>(key : string) 
    {
        return await this.cacheManager.get<T>(key) 
    }
    async incr(key : string) 
    {
        const nu = await this.cacheManager.get<number>(key) 
        console.log(nu) 
    }
}