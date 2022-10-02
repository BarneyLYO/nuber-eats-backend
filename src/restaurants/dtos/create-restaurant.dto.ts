import {
  Field,
  InputType,
  ObjectType,
  PickType
} from '@nestjs/graphql'

import { BaseOutputDto } from 'src/common/dtos/output.dto'
import { Restaurant } from '../entities/restaurants.entity'

// pass seperate value

@InputType()
export class CreateRestaurantInput extends PickType(
  Restaurant,
  ['name', 'coverImage', 'address']
) {
  @Field(() => String)
  categoryName: string
}

@ObjectType()
export class CreateRestaurantOutput extends BaseOutputDto {}
