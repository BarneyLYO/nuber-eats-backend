import { SetMetadata } from '@nestjs/common'
import { DECOR_KEY_ROLES } from 'src/common/common.constants'
import { UserRole } from 'src/users/entities/user.entity'

export type Allowed = UserRole | 'Any'
export const Roles = (...roles: Allowed[]) =>
  SetMetadata(DECOR_KEY_ROLES, roles)

export const AnyRole = () =>
  SetMetadata(DECOR_KEY_ROLES, 'Any')
