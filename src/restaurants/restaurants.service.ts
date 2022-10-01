import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateRestaurantDto } from './dtos/create-restaurant.dto'
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto'
import { Restaurant } from './entities/restaurants.entity'

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>
  ) {}

  async getAll() {
    return await this.restaurantRepository.find()
  }

  async createRestaurant(
    createRestaurant: CreateRestaurantDto
  ) {
    const restaurant = this.restaurantRepository.create(
      createRestaurant
    )
    return await this.restaurantRepository.save(restaurant)
  }

  async updateRestaurant({
    id,
    data
  }: UpdateRestaurantDto) {
    return await this.restaurantRepository.update(id, data)
  }
}
