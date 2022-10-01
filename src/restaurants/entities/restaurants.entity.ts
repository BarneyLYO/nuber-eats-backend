import { Field, ObjectType } from '@nestjs/graphql'
import {
  IsBoolean,
  IsOptional,
  IsString,
  Length
} from 'class-validator'
import {
  Column,
  Entity,
  PrimaryGeneratedColumn
} from 'typeorm'

// pass a object
@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(() => Number)
  id: number

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5, 10)
  name: string

  @Field(() => Boolean, {
    nullable: true,
    defaultValue: true
  })
  @Column({ default: true })
  @IsOptional()
  @IsBoolean()
  isVegan?: boolean

  @Field(() => String)
  @Column()
  @IsString()
  address: string

  @Field(() => String)
  @Column()
  @IsString()
  ownerName: string

  @Field(() => String)
  @Column()
  @IsString()
  categoryName: string
}
