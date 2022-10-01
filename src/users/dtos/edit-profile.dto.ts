import {
  InputType,
  ObjectType,
  PartialType,
  PickType
} from '@nestjs/graphql'
import { BaseOutputDto } from 'src/common/dtos/output.dto'
import { User } from '../entities/user.entity'

@ObjectType()
export class EditProfileOutput extends BaseOutputDto {}

@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['email', 'password'])
) {}
