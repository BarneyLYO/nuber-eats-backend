import {
  Field,
  InputType,
  ObjectType,
  PickType
} from '@nestjs/graphql'
import { BaseOutputDto } from 'src/common/dtos/output.dto'
import { User } from '../entities/user.entity'

@ObjectType()
export class LoginOutput extends BaseOutputDto {
  @Field(() => String, { nullable: true })
  token?: string
}

@InputType()
export class LoginInput extends PickType(User, [
  'email',
  'password'
]) {}
