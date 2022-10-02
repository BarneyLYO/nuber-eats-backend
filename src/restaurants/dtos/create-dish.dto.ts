import {
  Field,
  InputType,
  ObjectType,
  PickType
} from '@nestjs/graphql'
import { BaseOutputDto } from 'src/common/dtos/output.dto'
import { Dish } from '../entities/dish.entity'

@InputType()
export class CreateDishInput extends PickType(Dish, [
  'name',
  'price',
  'description',
  'options'
]) {
  @Field(() => String)
  restaurantId: string
}

@ObjectType()
export class CreateDishOutput extends BaseOutputDto {}
