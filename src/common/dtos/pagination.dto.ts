import {
  Field,
  InputType,
  Int,
  ObjectType
} from '@nestjs/graphql'
import { BaseOutputDto } from './output.dto'

@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number
}

@ObjectType()
export class PaginationOutput extends BaseOutputDto {
  @Field(() => Int, { nullable: true })
  totalPages?: number
  @Field(() => Int, { nullable: true })
  totalItems?: number
}
