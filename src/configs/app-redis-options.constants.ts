import { CacheModuleAsyncOptions } from '@nestjs/cache-manager'
import KeyvRedis from '@keyv/redis'

export const RedisOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  useFactory: async () => ({
    stores: [
      new KeyvRedis('redis://127.0.0.1:6379')
    ]
  })
}