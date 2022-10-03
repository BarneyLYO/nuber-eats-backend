import {
  Field,
  InputType,
  Int,
  ObjectType,
  PickType
} from '@nestjs/graphql'
import { BaseOutputDto } from 'src/common/dtos/output.dto'
import {
  Order,
  OrderItemOption,
  OrderStatus
} from '../entities/order.entity'

@InputType()
class CreateOrderItemInput {
  @Field(() => Int)
  dishId: string

  @Field(() => [OrderItemOption], { nullable: true })
  options?: OrderItemOption[]
}

@InputType()
export class CreateOrderInput {
  @Field(() => Int)
  restaurantId: string

  @Field(() => [CreateOrderItemInput])
  items: CreateOrderItemInput[]
}

@ObjectType()
export class CreateOrderOutput extends BaseOutputDto {
  @Field(() => Int, { nullable: true })
  orderId?: string
}

@InputType()
export class EditOrderInput extends PickType(Order, [
  'id',
  'status'
]) {}

@ObjectType()
export class EditOrderOutput extends BaseOutputDto {}

@InputType()
export class GetOrderInput extends PickType(Order, [
  'id'
]) {}

@ObjectType()
export class GetOrderOutput extends BaseOutputDto {
  @Field(() => Order, { nullable: true })
  order?: Order
}

@InputType()
export class GetOrdersInput {
  @Field(() => OrderStatus, { nullable: true })
  status?: OrderStatus
}

@ObjectType()
export class GetOrdersOutput extends BaseOutputDto {
  @Field(() => [Order], { nullable: true })
  orders?: Order[]
}

@InputType()
export class OrderUpdatesInput extends PickType(Order, [
  'id'
]) {}

@InputType()
export class TakeOrderInput extends PickType(Order, [
  'id'
]) {}

@ObjectType()
export class TakeOrderOutput extends BaseOutputDto {}
