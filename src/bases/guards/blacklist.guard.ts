import { RedisService } from "@/modules/redis/redis.service";
import { BadRequestException, CanActivate, ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";

@Injectable() 
export class BlacklistGuard implements CanActivate 
{
    constructor(
        private readonly redisService : RedisService
    ) {} 
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest() 
        const ip = request.ip 
        const key = `bookstore:blacklist:${ip}`
        const isExists = await this.redisService.exists(key) 
        if (isExists) 
            throw new BadRequestException("Your IP has been banned") 
        return true 
    }
}