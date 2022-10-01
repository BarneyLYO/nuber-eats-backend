import {
  createParamDecorator,
  ExecutionContext
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const gqlCtx =
      GqlExecutionContext.create(ctx).getContext()
    return gqlCtx['user']
  }
)
