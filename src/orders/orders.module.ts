import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Dish } from 'src/restaurants/entities/dish.entity'
import { Restaurant } from 'src/restaurants/entities/restaurants.entity'
import { Order, OrderItem } from './entities/order.entity'
import { OrderResolver } from './order.resolver'
import { OrderService } from './orders.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Restaurant,
      OrderItem,
      Dish
    ])
  ],
  providers: [OrderService, OrderResolver]
})
export class OrdersModule {}
