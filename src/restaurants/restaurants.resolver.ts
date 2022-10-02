import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver
} from '@nestjs/graphql'
import { AuthUser } from 'src/auth/auth-user.decorator'
import { Roles } from 'src/auth/role.decorator'
import {
  User,
  UserRole
} from 'src/users/entities/user.entity'
import { CategoryService } from './category.service'
import { AllCategoryOutput } from './dtos/all-category.dto'
import {
  CategoryInput,
  CategoryOutput
} from './dtos/category.dto'
import {
  CreateRestaurantInput,
  CreateRestaurantOutput
} from './dtos/create-restaurant.dto'
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput
} from './dtos/delete-restaurant.dts'
import {
  EditRestaurantInput,
  EditRestaurantOutput
} from './dtos/edit-restaurant.dto'
import {
  RestaurantInput,
  RestaurantOutput,
  RestaurantsInput,
  RestaurantsOutput
} from './dtos/restaurants.dto'
import {
  SearchRestaurantInput,
  SearchRestaurantOutput
} from './dtos/search-restaurant.dto'
import { Category } from './entities/category.entity'
import { Restaurant } from './entities/restaurants.entity'
import { RestaurantService } from './restaurants.service'

@Resolver(() => Restaurant)
export class RestaurantsResolver {
  constructor(
    private readonly restaurantService: RestaurantService
  ) {}

  @Mutation(() => CreateRestaurantOutput)
  @Roles(UserRole.Owner)
  async createRestaurant(
    @Args('input')
    createRestaurant: CreateRestaurantInput,
    @AuthUser() authUser: User
  ): Promise<CreateRestaurantOutput> {
    try {
      await this.restaurantService.createRestaurant(
        createRestaurant,
        authUser
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

  @Mutation(() => EditRestaurantOutput)
  @Roles(UserRole.Owner)
  async editRestaurant(
    @AuthUser() authUser: User,
    @Args('input') editRestaurantInput: EditRestaurantInput
  ) {
    try {
      const saved =
        await this.restaurantService.editRestaurant(
          authUser,
          editRestaurantInput
        )
      if (!saved) {
        throw new Error('Unable to make the update')
      }

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

  @Mutation(() => DeleteRestaurantOutput)
  @Roles(UserRole.Owner)
  async deleteRestaurant(
    @AuthUser() owner: User,
    @Args('input')
    deleteRestaurantInput: DeleteRestaurantInput
  ) {
    try {
      await this.restaurantService.deleteRestaurant(
        owner,
        deleteRestaurantInput
      )
    } catch (e) {
      return {
        ok: false,
        error: e
      }
    }
  }

  @Query(() => RestaurantsOutput)
  async restaurants(
    @Args('input') restaurantsInput: RestaurantsInput
  ) {
    try {
      const [restaurants, total] =
        await this.restaurantService.allRestaurants(
          restaurantsInput
        )
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(total / 25),
        totalItems: total
      }
    } catch (e) {
      return {
        ok: false,
        error: e
      }
    }
  }

  @Query(() => RestaurantOutput)
  async restaurant(@Args('input') input: RestaurantInput) {
    try {
      const found =
        await this.restaurantService.findRestaurantById(
          input
        )

      return {
        ok: true,
        restaurant: found
      }
    } catch (e) {
      return {
        ok: false,
        error: e
      }
    }
  }

  @Query(() => SearchRestaurantOutput)
  async searchRestaurant(
    @Args('input')
    searchRestaurantInput: SearchRestaurantInput
  ) {
    try {
      const [founds, total] =
        await this.restaurantService.searchRestaurantByName(
          searchRestaurantInput
        )
      return {
        ok: true,
        restaurants: founds,
        totalPages: Math.ceil(total / 25),
        totalItems: total
      }
    } catch (error) {
      return {
        ok: false,
        error
      }
    }
  }
}

@Resolver(() => Category)
export class CategoryResolver {
  constructor(
    private readonly categoryService: CategoryService
  ) {}

  /* Dynamic Field, will be resolved in any request */
  /* @Parent means get the resolved gql schema */
  @ResolveField(() => Int)
  async restaurantCount(@Parent() category: Category) {
    const found =
      (await this.categoryService.countRestaurant(
        category
      )) || []

    return found
  }

  @Query(() => AllCategoryOutput)
  async getAllCategorys() {
    try {
      const found =
        await this.categoryService.allCategories()

      if (!found) {
        throw new Error('Unable to find categories')
      }

      return {
        ok: true,
        categories: found
      }
    } catch (e) {
      return {
        ok: false,
        error: e
      }
    }
  }

  @Query(() => CategoryOutput)
  async category(
    @Args('input') categoryInput: CategoryInput
  ) {
    try {
      const cate =
        await this.categoryService.findCategoryBySlug(
          categoryInput
        )
      const total =
        (await this.categoryService.countRestaurant(cate)) /
        25

      return {
        ok: true,
        category: cate,
        totalPages: Math.ceil(total)
      }
    } catch (e) {
      return {
        ok: false,
        error: e
      }
    }
  }
}
