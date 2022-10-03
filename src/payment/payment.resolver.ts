import {
  Args,
  Mutation,
  Query,
  Resolver
} from '@nestjs/graphql'
import { AuthUser } from 'src/auth/auth-user.decorator'
import { Roles } from 'src/auth/role.decorator'
import {
  User,
  UserRole
} from 'src/users/entities/user.entity'
import {
  CreatePaymentInput,
  CreatePaymentOuput,
  GetPaymentsOutput
} from './dto/payment.dto'
import { Payment } from './entities/payment.entity'
import { PaymentService } from './payment.service'

@Resolver(() => Payment)
export class PaymentResolver {
  constructor(
    private readonly paymentService: PaymentService
  ) {}

  @Mutation(() => CreatePaymentOuput)
  @Roles(UserRole.Owner)
  async createPayment(
    @AuthUser() owner: User,
    @Args('input') createPaymentInput: CreatePaymentInput
  ): Promise<CreatePaymentOuput> {
    try {
      await this.paymentService.createPayment(
        owner,
        createPaymentInput
      )
      return {
        ok: true
      }
    } catch (e) {
      return {
        ok: false,
        error: e
      }
    }
  }

  @Query(() => GetPaymentsOutput)
  @Roles(UserRole.Owner)
  async getPayments(
    @AuthUser() user: User
  ): Promise<GetPaymentsOutput> {
    try {
      const payments =
        await this.paymentService.getPayments(user)
      return {
        payments,
        ok: true
      }
    } catch (e) {
      return {
        ok: false,
        error: e
      }
    }
  }
}
