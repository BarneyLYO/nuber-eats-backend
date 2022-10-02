import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CategoryService } from './category.service'
import { Category } from './entities/category.entity'
import { Restaurant } from './entities/restaurants.entity'
import { CategoryRepository } from './repositories/category.repository'
import {
  CategoryResolver,
  RestaurantsResolver
} from './restaurants.resolver'
import { RestaurantService } from './restaurants.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, Category])
  ],
  providers: [
    RestaurantsResolver,
    CategoryResolver,
    RestaurantService,
    CategoryService
  ]
})
export class RestaurantsModule {}
