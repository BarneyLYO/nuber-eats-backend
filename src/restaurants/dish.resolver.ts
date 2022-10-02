import {
  Args,
  Mutation,
  Query,
  Resolver
} from '@nestjs/graphql'
import { AuthUser } from 'src/auth/auth-user.decorator'
import { Roles } from 'src/auth/role.decorator'
import {
  User,
  UserRole
} from 'src/users/entities/user.entity'
import {
  CreateDishInput,
  CreateDishOutput
} from './dtos/create-dish.dto'
import {
  DeleteDishInput,
  DeleteDishOutput
} from './dtos/delete-dish.dto'
import {
  EditDishInput,
  EditDishOutput
} from './dtos/edit-dish.dto'
import { Dish } from './entities/dish.entity'
import { RestaurantService } from './restaurants.service'

@Resolver(() => Dish)
export class DishResolver {
  constructor(
    private readonly restaurantService: RestaurantService
  ) {}

  @Roles(UserRole.Owner)
  @Mutation(() => CreateDishOutput)
  async createDish(
    @AuthUser() owner: User,
    @Args('input') createDishInput: CreateDishInput
  ) {
    try {
      await this.restaurantService.createDish(
        owner,
        createDishInput
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

  @Roles(UserRole.Owner)
  @Mutation(() => EditDishOutput)
  async editDish(
    @AuthUser() owner: User,
    @Args('input') editDishInput: EditDishInput
  ) {
    try {
      await this.restaurantService.editDish(
        owner,
        editDishInput
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

  @Roles(UserRole.Owner)
  @Mutation(() => DeleteDishOutput)
  async deleteDish(
    @AuthUser() owner: User,
    @Args('input') deleteDishInput: DeleteDishInput
  ) {
    try {
      await this.restaurantService.deleteDish(
        owner,
        deleteDishInput
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
}
