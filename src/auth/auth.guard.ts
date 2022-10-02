import {
  CanActivate,
  ExecutionContext,
  Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { Observable } from 'rxjs'
import { DECOR_KEY_ROLES } from 'src/common/common.constants'
import { User } from 'src/users/entities/user.entity'
import { Allowed } from './role.decorator'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const role = this.reflector.get<Allowed[]>(
      DECOR_KEY_ROLES,
      context.getHandler()
    )

    if (!role) {
      return true
    }

    const gqlContext =
      GqlExecutionContext.create(context).getContext()
    const { user } = gqlContext
    if (!user) return false
    return (
      role.indexOf((user as User).role) !== -1 ||
      role.indexOf('Any') !== -1
    )
  }
}
