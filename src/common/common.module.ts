import { Global, Module } from '@nestjs/common'
import { INJECT_KEY_PUB_SUB } from './common.constants'
import { PubSub } from 'graphql-subscriptions'

@Global()
@Module({
  providers: [
    {
      provide: INJECT_KEY_PUB_SUB,
      useValue: new PubSub()
    }
  ],
  exports: [INJECT_KEY_PUB_SUB]
})
export class CommonModule {}
