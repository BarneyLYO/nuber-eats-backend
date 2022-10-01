import {
  ArgsType,
  Field,
  ObjectType
} from '@nestjs/graphql'
import { BaseOutputDto } from 'src/common/dtos/output.dto'
import { User } from '../entities/user.entity'

@ArgsType()
export class UserProfileInput {
  @Field(() => String)
  userId: string
}

@ObjectType()
export class userProfileOutput extends BaseOutputDto {
  @Field(() => User, { nullable: true })
  user?: User
}
