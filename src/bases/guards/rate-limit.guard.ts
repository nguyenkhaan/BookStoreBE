//Usign request.ip to make the rate-limit guard
import { RedisService } from '@/modules/redis/redis.service';
import {
	BadRequestException,
	CanActivate,
	ExecutionContext,
	Injectable,
} from '@nestjs/common';
import { REDIS_RATE_LIMIT_TTL } from '../commons/constants/redis.constant';

@Injectable()
export class RateLimitGuard implements CanActivate {
	constructor(private readonly redisService: RedisService) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const ip = request.ip;
		console.log('Rate Limit Hit', ip);
		const key = `bookstore:rate:${ip}`;
		const count: number = await this.redisService.incr(
			key,
			REDIS_RATE_LIMIT_TTL,
		);
		if (count > 100) throw new BadRequestException('Too many Requests');
		return true;
	}
}
