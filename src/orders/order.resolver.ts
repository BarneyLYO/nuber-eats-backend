import {
  Args,
  Mutation,
  Query,
  Resolver,
  Subscription
} from '@nestjs/graphql'
import { AuthUser } from 'src/auth/auth-user.decorator'
import { AnyRole, Roles } from 'src/auth/role.decorator'
import {
  INJECT_KEY_PUB_SUB,
  SUB_TRIGGER_NEW_COOKED_ORDER,
  SUB_TRIGGER_NEW_ORDER_UPDATE,
  SUB_TRIGGER_NEW_PENDING_ORDER
} from 'src/common/common.constants'
import {
  User,
  UserRole
} from 'src/users/entities/user.entity'
import {
  CreateOrderInput,
  CreateOrderOutput,
  EditOrderInput,
  EditOrderOutput,
  GetOrderInput,
  GetOrderOutput,
  GetOrdersInput,
  GetOrdersOutput,
  OrderUpdatesInput,
  TakeOrderInput,
  TakeOrderOutput
} from './dtos/orders.dto'
import { Order } from './entities/order.entity'
import { OrderService } from './orders.service'
import { PubSub } from 'graphql-subscriptions'
import { Inject } from '@nestjs/common'

@Resolver(() => Order)
export class OrderResolver {
  constructor(
    private readonly ordersService: OrderService,
    @Inject(INJECT_KEY_PUB_SUB)
    private readonly pubSub: PubSub
  ) {}

  @Mutation(() => CreateOrderOutput)
  @Roles(UserRole.Client)
  async createOrder(
    @AuthUser() customer: User,
    @Args('input')
    createOrderInput: CreateOrderInput
  ) {
    try {
      const created = await this.ordersService.createOrder(
        customer,
        createOrderInput
      )
      return {
        orderId: created.id,
        ok: true
      }
    } catch (e) {
      return {
        ok: false,
        error: e
      }
    }
  }

  @Query(() => GetOrdersOutput)
  @AnyRole()
  async getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput
  ): Promise<GetOrdersOutput> {
    try {
      const orders = await this.ordersService.getOrders(
        user,
        getOrdersInput
      )
      return {
        ok: true,
        orders
      }
    } catch (e) {
      return {
        ok: false,
        error: e
      }
    }
  }

  @Query(() => GetOrderOutput)
  @AnyRole()
  async getOrder(
    @AuthUser() user: User,
    @Args('input') getOrderInput: GetOrderInput
  ): Promise<GetOrderOutput> {
    try {
      const order = await this.ordersService.getOrder(
        user,
        getOrderInput
      )

      return {
        ok: true,
        order
      }
    } catch (e) {
      return {
        ok: false,
        error: e
      }
    }
  }

  @Mutation(() => EditOrderOutput)
  @AnyRole()
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput
  ): Promise<EditOrderOutput> {
    try {
      await this.ordersService.editOrder(
        user,
        editOrderInput
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

  @Mutation(() => TakeOrderOutput)
  @Roles(UserRole.Delivery)
  async takeOrder(
    @AuthUser() driver: User,
    @Args('input') takeOrderInput: TakeOrderInput
  ): Promise<TakeOrderOutput> {
    try {
      await this.ordersService.takeOrder(
        driver,
        takeOrderInput
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

  @Subscription(() => Order, {
    filter: (
      { pendingOrders: { ownerId } },
      _,
      { user }
    ) => {
      return ownerId === user.id
    },
    resolve: ({ pendingOrders: { order } }) => {
      return order
    }
  })
  @Roles(UserRole.Owner)
  pendingOrders() {
    return this.pubSub.asyncIterator(
      SUB_TRIGGER_NEW_PENDING_ORDER
    )
  }

  @Subscription(() => Order, {
    filter: (
      { pendingOrders: { ownerId } },
      _,
      { user }
    ) => {
      return ownerId === user.id
    },
    resolve: ({ pendingOrders: { order } }) => {
      return order
    }
  })
  @Roles(UserRole.Delivery)
  cookedOrders() {
    return this.pubSub.asyncIterator(
      SUB_TRIGGER_NEW_COOKED_ORDER
    )
  }

  @Subscription(() => Order, {
    filter: (
      { orderUpdates }: { orderUpdates: Order },
      { input }: { input: OrderUpdatesInput },
      { user }: { user: User }
    ) => {
      if (
        orderUpdates.driverId !== user.id &&
        orderUpdates.customerId !== user.id &&
        orderUpdates.restaurant.ownerId !== user.id
      ) {
        return false
      }

      return orderUpdates.id === input.id
    }
  })
  @AnyRole()
  orderUpdates(
    @Args('input') orderUpdatesInput: OrderUpdatesInput
  ) {
    return this.pubSub.asyncIterator(
      SUB_TRIGGER_NEW_ORDER_UPDATE
    )
  }
}
