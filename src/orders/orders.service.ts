import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  INJECT_KEY_PUB_SUB,
  SUB_TRIGGER_NEW_COOKED_ORDER,
  SUB_TRIGGER_NEW_ORDER_UPDATE,
  SUB_TRIGGER_NEW_PENDING_ORDER
} from 'src/common/common.constants'
import { Dish } from 'src/restaurants/entities/dish.entity'
import { Restaurant } from 'src/restaurants/entities/restaurants.entity'
import { PubSub } from 'graphql-subscriptions'
import {
  User,
  UserRole
} from 'src/users/entities/user.entity'
import { Repository } from 'typeorm'
import {
  CreateOrderInput,
  EditOrderInput,
  GetOrderInput,
  GetOrdersInput,
  TakeOrderInput
} from './dtos/orders.dto'
import {
  Order,
  OrderItem,
  OrderStatus
} from './entities/order.entity'

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
    @Inject(INJECT_KEY_PUB_SUB)
    private readonly pubSub: PubSub
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput
  ) {
    const restaurant = await this.restaurants.findOne({
      where: {
        id: restaurantId
      }
    })

    if (!restaurant) {
      throw new Error('Restaurant not found')
    }
    let orderFinalPrice = 0
    const orderItems: OrderItem[] = []

    for (const item of items) {
      const dish = await this.dishes.findOne({
        where: {
          id: item.dishId
        }
      })
      if (!dish) {
        throw new Error('Dish not found.')
      }
      let dishFinalPrice = dish.price

      for (const itemOption of item.options) {
        const dishOption = dish.options.find(
          (dishOption) =>
            dishOption.name === itemOption.name
        )
        if (dishOption) {
          if (dishOption.extra) {
            dishFinalPrice =
              dishFinalPrice + dishOption.extra
          } else {
            const dishOptionChoice =
              dishOption.choice?.find(
                (optionChoice) =>
                  optionChoice.name === itemOption.choice
              )
            if (dishOptionChoice) {
              if (dishOptionChoice.extra) {
                dishFinalPrice =
                  dishFinalPrice + dishOptionChoice.extra
              }
            }
          }
        }
      }

      orderFinalPrice = orderFinalPrice + dishFinalPrice

      const orderItem = await this.orderItems.save(
        this.orderItems.create({
          dish,
          options: item.options
        })
      )
      orderItems.push(orderItem)
      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems
        })
      )

      await this.pubSub.publish(
        SUB_TRIGGER_NEW_PENDING_ORDER,
        {
          pendingOrders: {
            // new of resolver
            order,
            ownerId: restaurant.ownerId
          }
        }
      )
      return order
    }
  }

  async getOrders(user: User, { status }: GetOrdersInput) {
    let orders: Order[]
    if (user.role === UserRole.Client) {
      orders = await this.orders.find({
        where: {
          customer: {
            id: user.id
          },
          ...(status && { status })
        }
      })
    } else if (user.role === UserRole.Delivery) {
      orders = await this.orders.find({
        where: {
          driver: {
            id: user.id
          },
          ...(status && { status })
        }
      })
    } else if (user.role === UserRole.Owner) {
      const restaurants = await this.restaurants.find({
        where: {
          owner: {
            id: user.id
          }
        },
        relations: ['orders']
      })
      orders = restaurants
        .map((restaurant) => restaurant.orders)
        .flat(1)
      if (status) {
        orders = orders.filter(
          (order) => order.status === status
        )
      }
    }
    return orders
  }

  canSeeOrder(user: User, order: Order) {
    let canSee = true
    if (
      user.role === UserRole.Client &&
      order.customerId !== user.id
    ) {
      canSee = false
    }
    if (
      user.role === UserRole.Delivery &&
      order.driverId !== user.id
    ) {
      canSee = false
    }
    if (
      user.role === UserRole.Owner &&
      order.restaurant.ownerId !== user.id
    ) {
      canSee = false
    }
    return canSee
  }

  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput
  ) {
    const order = await this.orders.findOne({
      where: {
        id: orderId
      },
      relations: ['restaurant']
    })
    if (!order) {
      throw new Error('Order not found')
    }

    if (!this.canSeeOrder(user, order)) {
      throw new Error('You cant see that')
    }

    return order
  }

  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput
  ) {
    const order = await this.orders.findOne({
      where: {
        id: orderId
      }
    })
    if (!order) {
      throw new Error('Order not found')
    }

    if (!this.canSeeOrder(user, order)) {
      throw new Error(`Can't see this.`)
    }
    let canEdit = true
    if (user.role === UserRole.Client) {
      canEdit = false
    }
    if (user.role === UserRole.Owner) {
      if (
        status !== OrderStatus.COOKING &&
        status !== OrderStatus.COOKED
      ) {
        canEdit = false
      }
    }
    if (user.role === UserRole.Delivery) {
      if (
        status !== OrderStatus.PICKE_UP &&
        status !== OrderStatus.DELIVERED
      ) {
        canEdit = false
      }
    }

    if (!canEdit) {
      throw new Error(`You can't do that.`)
    }

    await this.orders.save({
      id: orderId,
      status
    })
    const newOrder = { ...order, status }
    if (user.role === UserRole.Owner) {
      if (status === OrderStatus.COOKED) {
        await this.pubSub.publish(
          SUB_TRIGGER_NEW_COOKED_ORDER,
          {
            cookedOrders: newOrder
          }
        )
      }
    }
    await this.pubSub.publish(
      SUB_TRIGGER_NEW_ORDER_UPDATE,
      { orderUpdates: newOrder }
    )

    return newOrder
  }

  async takeOrder(
    driver: User,
    { id: orderId }: TakeOrderInput
  ) {
    const order = await this.orders.findOne({
      where: {
        id: orderId
      }
    })

    if (!order) {
      throw new Error('Order not found')
    }

    if (order.driver) {
      throw new Error('This order already has a driver')
    }

    const saved = await this.orders.save({
      id: orderId,
      driver
    })

    await this.pubSub.publish(
      SUB_TRIGGER_NEW_ORDER_UPDATE,
      {
        orderUpdates: { ...order, driver }
      }
    )

    return saved
  }
}
