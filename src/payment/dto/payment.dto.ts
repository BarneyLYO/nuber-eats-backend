import {
  Field,
  InputType,
  ObjectType,
  PickType
} from '@nestjs/graphql'
import { BaseOutputDto } from 'src/common/dtos/output.dto'
import { Payment } from '../entities/payment.entity'

@InputType()
export class CreatePaymentInput extends PickType(Payment, [
  'transactionId',
  'restaurantId'
]) {}

@ObjectType()
export class CreatePaymentOuput extends BaseOutputDto {}

@ObjectType()
export class GetPaymentsOutput extends BaseOutputDto {
  @Field(() => [Payment], { nullable: true })
  payments?: Payment[]
}
