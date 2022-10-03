import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Restaurant } from 'src/restaurants/entities/restaurants.entity'
import { User } from 'src/users/entities/user.entity'
import { LessThan, Repository } from 'typeorm'
import { CreatePaymentInput } from './dto/payment.dto'
import { Payment } from './entities/payment.entity'
import { Cron, CronExpression } from '@nestjs/schedule'

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>
  ) {}

  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput
  ) {
    const restaurant = await this.restaurants.findOne({
      where: {
        id: restaurantId
      }
    })
    if (!restaurant) {
      throw new Error('Restaurant not found.')
    }
    if (restaurant.ownerId !== owner.id) {
      throw new Error('You are not allowed to do this.')
    }
    await this.payments.save(
      this.payments.create({
        transactionId,
        user: owner,
        restaurant
      })
    )
    restaurant.isPromoted = true
    const date = new Date()
    date.setDate(date.getDate() + 7)
    restaurant.promotedUntil = date
    return await this.restaurants.save(restaurant)
  }

  async getPayments(user: User) {
    return await this.payments.find({
      where: {
        user: {
          id: user.id
        }
      }
    })
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkPromotedRestaurants() {
    const restaurants = await this.restaurants.find({
      where: {
        isPromoted: true,
        promotedUntil: LessThan(new Date())
      }
    })
    restaurants.forEach(async (restaurant) => {
      restaurant.isPromoted = false
      restaurant.promotedUntil = null
      await this.restaurants.save(restaurant)
    })
  }
}
