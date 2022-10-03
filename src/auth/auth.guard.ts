import {
  CanActivate,
  ExecutionContext,
  Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GqlExecutionContext } from '@nestjs/graphql'
import { Observable } from 'rxjs'
import { DECOR_KEY_ROLES } from 'src/common/common.constants'
import { JwtService } from 'src/jwt/jwt.service'
import { UsersService } from 'src/users/users.service'
import { Allowed } from './role.decorator'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService
  ) {}

  private async validateToken(
    token: string,
    role: Allowed[],
    gqlCtx: any
  ) {
    try {
      const decoded = this.jwtService.verify(token + '')
      if (
        typeof decoded !== 'object' ||
        !decoded.hasOwnProperty('id')
      ) {
        console.warn(
          'You dont have access permission to the url'
        )
        return false
      }

      const user = await this.userService.findById(
        decoded.id
      )

      if (!user) {
        return false
      }

      gqlCtx.user = user

      return (
        role.indexOf(user.role) !== -1 ||
        role.indexOf('Any') !== -1
      )
    } catch (e) {
      console.warn(e)
      return false
    }
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const role = this.reflector.get<Allowed[]>(
      DECOR_KEY_ROLES,
      context.getHandler()
    )

    // public api
    if (!role) {
      return true
    }

    const gqlContext =
      GqlExecutionContext.create(context).getContext()

    const { token } = gqlContext

    return this.validateToken(token, role, gqlContext)
  }
}
