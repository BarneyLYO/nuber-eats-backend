import { Field, InputType, OmitType } from '@nestjs/graphql'
import {
  IsBoolean,
  IsString,
  Length
} from 'class-validator'
import { Restaurant } from '../entities/restaurants.entity'

// pass seperate value
@InputType()
export class CreateRestaurantDto extends OmitType(
  Restaurant,
  ['id'],
  InputType
) {}
