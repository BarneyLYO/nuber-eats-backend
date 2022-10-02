import {
  Field,
  InputType,
  ObjectType
} from '@nestjs/graphql'
import { BaseOutputDto } from 'src/common/dtos/output.dto'

@InputType()
export class DeleteDishInput {
  @Field(() => String)
  dishId: string
}

@ObjectType()
export class DeleteDishOutput extends BaseOutputDto {}
