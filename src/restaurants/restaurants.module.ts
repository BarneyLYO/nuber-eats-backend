import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoryService } from './category.service'
import { DishResolver } from './dish.resolver'
import { Category } from './entities/category.entity'
import { Dish } from './entities/dish.entity'
import { Restaurant } from './entities/restaurants.entity'
import {
  CategoryResolver,
  RestaurantsResolver
} from './restaurants.resolver'
import { RestaurantService } from './restaurants.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, Category, Dish])
  ],
  providers: [
    RestaurantsResolver,
    CategoryResolver,
    RestaurantService,
    CategoryService,
    DishResolver
  ]
})
export class RestaurantsModule {}
