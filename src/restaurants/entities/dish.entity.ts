import {
  Field,
  InputType,
  Int,
  ObjectType
} from '@nestjs/graphql'
import { IsNumber, IsString, Length } from 'class-validator'
import { CoreEntity } from 'src/common/entities/core.entity'
import {
  Column,
  Entity,
  ManyToOne,
  RelationId
} from 'typeorm'
import { Restaurant } from './restaurants.entity'

@InputType('DishChoiceInputType', {
  isAbstract: true
})
@ObjectType()
class DishChoice {
  @Field(() => String)
  name: string
  @Field(() => Int, { nullable: true })
  extra?: number
}

@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
class DishOption {
  @Field(() => String)
  name: string

  @Field(() => [DishChoice], { nullable: true })
  choice?: DishChoice[]

  @Field(() => Number, { nullable: true })
  extra: number
}

@InputType('DishInputType', {
  isAbstract: true
})
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  name: string

  @Field(() => Int)
  @Column()
  @IsNumber()
  price: number

  @Field(() => String, { nullable: true })
  @Column({ default: null })
  @IsString()
  photo?: string

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5, 140)
  description: string

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(
    () => Restaurant,
    (restaurant) => restaurant.menu,
    {
      onDelete: 'CASCADE'
    }
  )
  restaurant: Restaurant

  @RelationId((dish: Dish) => dish.restaurant)
  resturantId: string

  @Field(() => [DishOption], { nullable: true })
  @Column({ type: 'json', default: null, nullable: true })
  options?: DishOption[]
}
