import {
  Field,
  InputType,
  ObjectType,
  PartialType
} from '@nestjs/graphql'

import { BaseOutputDto } from 'src/common/dtos/output.dto'
import { CreateRestaurantInput } from './create-restaurant.dto'

// pass seperate value

@InputType()
export class EditRestaurantInput extends PartialType(
  CreateRestaurantInput
) {
  @Field(() => String)
  restaurantId: string
}

@ObjectType()
export class EditRestaurantOutput extends BaseOutputDto {}
