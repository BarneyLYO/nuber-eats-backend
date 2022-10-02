import {
  InputType,
  ObjectType,
  PickType
} from '@nestjs/graphql'
import { BaseOutputDto } from 'src/common/dtos/output.dto'
import { Dish } from '../entities/dish.entity'

@InputType()
export class EditDishInput extends PickType(Dish, [
  'id',
  'name',
  'options',
  'price',
  'description',
  'resturantId'
]) {}

@ObjectType()
export class EditDishOutput extends BaseOutputDto {}
