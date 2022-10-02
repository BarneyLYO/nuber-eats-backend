import {
  Field,
  InputType,
  ObjectType
} from '@nestjs/graphql'
import { IsString, Length } from 'class-validator'
import { CoreEntity } from 'src/common/entities/core.entity'
import { Column, Entity, OneToMany } from 'typeorm'
import { Restaurant } from './restaurants.entity'

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  @Length(1, 100)
  name: string

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  coverImage?: string

  @Field(() => String)
  @Column()
  @IsString()
  slug: string

  @Field(() => [Restaurant])
  @OneToMany(
    () => Restaurant,
    (restaurant) => restaurant.category
  )
  restaurants: Restaurant[]
}
