import {
  Args,
  Mutation,
  Query,
  Resolver
} from '@nestjs/graphql'
import { CreateRestaurantDto } from './dtos/create-restaurant.dto'
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
  createRestautant(
    @Args()
    {
      address,
      isVegan,
      name,
      ownersName
    }: CreateRestaurantDto
  ) {
    return true
  }
}
