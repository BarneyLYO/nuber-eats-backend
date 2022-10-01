import {
  Field,
  InputType,
  ObjectType,
  PickType
} from '@nestjs/graphql'
import { BaseOutputDto } from 'src/common/dtos/output.dto'
import { User } from '../entities/user.entity'

@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role'
]) {}

@ObjectType()
export class CreateAccountOutput extends BaseOutputDto {}
