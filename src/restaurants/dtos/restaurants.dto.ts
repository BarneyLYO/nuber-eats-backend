import {
  Field,
  InputType,
  ObjectType
} from '@nestjs/graphql'
import { BaseOutputDto } from 'src/common/dtos/output.dto'
import {
  PaginationInput,
  PaginationOutput
} from 'src/common/dtos/pagination.dto'
import { Restaurant } from '../entities/restaurants.entity'

@InputType()
export class RestaurantsInput extends PaginationInput {}

@ObjectType()
export class RestaurantsOutput extends PaginationOutput {
  @Field(() => [Restaurant], { nullable: true })
  results?: Restaurant[]
}

@InputType()
export class RestaurantInput {
  @Field(() => String)
  restaurantId: string
}

@ObjectType()
export class RestaurantOutput extends BaseOutputDto {
  @Field(() => Restaurant, { nullable: true })
  restaurant?: Restaurant
}
