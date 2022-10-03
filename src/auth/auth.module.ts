import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { UsersModule } from 'src/users/users.module'
import { AuthGuard } from './auth.guard'

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ],
  imports: [UsersModule]
})
export class AuthModule {}
