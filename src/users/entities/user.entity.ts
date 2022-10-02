import {
  Field,
  InputType,
  ObjectType,
  registerEnumType
} from '@nestjs/graphql'
import { IsEmail, IsEnum } from 'class-validator'
import { CoreEntity } from 'src/common/entities/core.entity'
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany
} from 'typeorm'
import * as Bcrypt from 'bcrypt'
import { InternalServerErrorException } from '@nestjs/common'
import { Restaurant } from 'src/restaurants/entities/restaurants.entity'

export enum UserRole {
  Owner,
  Client,
  Delivery
}

registerEnumType(UserRole, { name: 'UserRole' })

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column({
    unique: true
  })
  @Field(() => String)
  @IsEmail()
  email: string

  @Column({ select: false })
  @Field(() => String)
  password: string

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole

  @Column({ default: true })
  @Field(() => Boolean)
  verified: boolean

  @Field(() => [Restaurant])
  @OneToMany(
    () => Restaurant,
    (restaurant) => restaurant.owner
  )
  restaurants: Restaurant[]

  async checkPassword(aPassword: string) {
    try {
      const ok = await Bcrypt.compare(
        aPassword,
        this.password
      )
      return ok
    } catch (e) {
      console.log(e)
      throw new InternalServerErrorException()
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (!this.password) return
    console.log('Hashing password......')
    try {
      this.password = await Bcrypt.hash(this.password, 10)
      console.log('Hashing done......')
    } catch (e) {
      console.log('HASH ERROR: ', e)
      throw new InternalServerErrorException(e)
    }
  }
}
