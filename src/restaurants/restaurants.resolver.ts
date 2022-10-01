import {
  Args,
  Mutation,
  Query,
  Resolver
} from '@nestjs/graphql'
import { CreateRestaurantDto } from './dtos/create-restaurant.dto'
import { UpdateRestaurantDto } from './dtos/update-restaurant.dto'
import { Restaurant } from './entities/restaurants.entity'
import { RestaurantService } from './restaurants.service'

@Resolver(() => Restaurant)
export class RestaurantsResolver {
  constructor(
    private readonly restaurantService: RestaurantService
  ) {}

  @Query(() => [Restaurant])
  restaurants() {
    return this.restaurantService.getAll()
  }

  // @Mutation(() => Boolean)
  // createRestautant(
  //   @Args('name') name: string,
  //   @Args('isVegan') isVegan: boolean,
  //   @Args('address') address: string,
  //   @Args('ownerName') ownersName: string
  // ) {
  //   return true
  // }

  @Mutation(() => Boolean)
  async createRestautant(
    @Args('input')
    createRestaurant: CreateRestaurantDto
  ) {
    try {
      await this.restaurantService.createRestaurant(
        createRestaurant
      )
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }

  @Mutation(() => Boolean)
  async updateRestaurant(
    @Args('input') updateRestaurantDto: UpdateRestaurantDto
  ) {
    try {
      await this.restaurantService.updateRestaurant(
        updateRestaurantDto
      )
      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }
}
