import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType
} from '@nestjs/graphql'
import { IsEnum, IsNumber } from 'class-validator'
import { CoreEntity } from 'src/common/entities/core.entity'
import { Dish } from 'src/restaurants/entities/dish.entity'
import { Restaurant } from 'src/restaurants/entities/restaurants.entity'
import { User } from 'src/users/entities/user.entity'
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  RelationId
} from 'typeorm'

export enum OrderStatus {
  PENDING,
  COOKING,
  COOKED,
  PICKE_UP,
  DELIVERED
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus'
})

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
    // force to load the customer when execute the query
    // might cause N+1 problem of graphql
    eager: true
  })
  customer?: User

  @RelationId((order: Order) => order.customer)
  customerId: string

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.rides, {
    onDelete: 'SET NULL',
    nullable: true,
    eager: true
  })
  driver?: User

  @RelationId((order: Order) => order.driver)
  driverId: string

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(
    () => Restaurant,
    (restaurant) => restaurant.orders,
    { onDelete: 'SET NULL', nullable: true, eager: true }
  )
  restaurant?: Restaurant

  @Field(() => [OrderItem])
  @ManyToMany(() => OrderItem, { eager: true })
  @JoinTable()
  items: OrderItem[]

  @Column({ nullable: true })
  @Field(() => Float, { nullable: true })
  @IsNumber()
  total?: number

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  @Field(() => OrderStatus)
  @IsEnum(OrderStatus)
  status: OrderStatus
}

@InputType('OrderItemOptionInputType', { isAbstract: true })
@ObjectType()
export class OrderItemOption {
  @Field(() => String)
  name: string
  @Field(() => String, { nullable: true })
  choice: string
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @Field(() => Dish)
  @ManyToOne(() => Dish, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  dish: Dish

  @Field(() => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[]
}
