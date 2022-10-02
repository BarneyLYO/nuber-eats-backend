import {
  Field,
  InputType,
  ObjectType
} from '@nestjs/graphql'
import { IsString, Length } from 'class-validator'
import { CoreEntity } from 'src/common/entities/core.entity'
import { User } from 'src/users/entities/user.entity'
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  RelationId
} from 'typeorm'
import { Category } from './category.entity'
import { Dish } from './dish.entity'

@InputType('RestaurantInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(5, 100)
  name: string

  @Field(() => String)
  @Column()
  @IsString()
  coverImage: string

  @Field(() => String, { defaultValue: 'UNKNOWN' })
  @Column()
  @IsString()
  address: string

  @Field(() => Category)
  @ManyToOne(
    () => Category,
    (categoty) => categoty.restaurants,
    {
      nullable: true,
      onDelete: 'SET NULL'
    }
  )
  category: Category

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.restaurants)
  owner: User

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: string

  @Field(() => [Dish])
  @OneToMany(() => Dish, (dish) => dish.restaurant)
  menu: Dish[]
}
