import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/users/entities/user.entity'
import { Raw, Repository } from 'typeorm'
import { CategoryService } from './category.service'
import { CreateDishInput } from './dtos/create-dish.dto'
import { CreateRestaurantInput } from './dtos/create-restaurant.dto'
import { DeleteDishInput } from './dtos/delete-dish.dto'
import { DeleteRestaurantInput } from './dtos/delete-restaurant.dts'
import { EditDishInput } from './dtos/edit-dish.dto'
import { EditRestaurantInput } from './dtos/edit-restaurant.dto'
import {
  RestaurantInput,
  RestaurantsInput
} from './dtos/restaurants.dto'
import { SearchRestaurantInput } from './dtos/search-restaurant.dto'
import { Category } from './entities/category.entity'
import { Dish } from './entities/dish.entity'
import { Restaurant } from './entities/restaurants.entity'

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishRepository: Repository<Dish>,
    private readonly categoryService: CategoryService
  ) {}

  async getAll() {
    return await this.restaurantRepository.find()
  }

  async createRestaurant(
    createRestaurant: CreateRestaurantInput,
    owner: User
  ) {
    const newResturant = this.restaurantRepository.create(
      createRestaurant
    )
    newResturant.owner = owner

    const categoryName = createRestaurant.categoryName
      .trim()
      .toLowerCase()

    newResturant.category =
      await this.categoryService.findOrCreateCategory(
        categoryName
      )

    await this.restaurantRepository.save(newResturant)
  }

  async editRestaurant(
    owener: User,
    editRestaurantInput: EditRestaurantInput
  ) {
    await this.findRestaurantByIdAndCheckOwnership(
      owener,
      editRestaurantInput.restaurantId
    )
    let category: Category
    if (editRestaurantInput.categoryName) {
      category =
        await this.categoryService.findOrCreateCategory(
          editRestaurantInput.categoryName
        )
    }

    return await this.restaurantRepository.save([
      {
        id: editRestaurantInput.restaurantId,
        ...editRestaurantInput,
        ...(category && {
          category
        })
      }
    ])
  }

  async deleteRestaurant(
    owner: User,
    deleteRestaurantInput: DeleteRestaurantInput
  ) {
    const restaurant =
      await this.findRestaurantByIdAndCheckOwnership(
        owner,
        deleteRestaurantInput.restaurantId
      )

    await this.restaurantRepository.delete({
      id: restaurant.id
    })

    return restaurant
  }

  private async findRestaurantByIdAndCheckOwnership(
    owner: User,
    id: string
  ) {
    const restaurant =
      await this.restaurantRepository.findOne({
        where: {
          id
        },
        loadRelationIds: true // only load the refered foreign key Id
      })

    if (!restaurant) {
      throw new Error('Restaurant not found')
    }

    if (restaurant.ownerId !== owner.id) {
      throw new Error('Restaurant is not owned by you')
    }

    return restaurant
  }

  async allRestaurants({ page }: RestaurantsInput) {
    return await this.restaurantRepository.findAndCount({
      skip: (page - 1) * 25,
      take: 25
    })
  }

  async findRestaurantById({
    restaurantId
  }: RestaurantInput) {
    return await this.restaurantRepository.findOne({
      where: {
        id: restaurantId
      },
      relations: ['owner', 'menu']
    })
  }

  async searchRestaurantByName({
    query,
    page
  }: SearchRestaurantInput) {
    return await this.restaurantRepository.findAndCount({
      where: {
        // name: Like(`%${query}%`)
        name: Raw(
          (name) =>
            `LOWER(${name}) LIKE '%${query.toLowerCase()}%'`
        )
      },
      take: 25,
      skip: (page - 1) * 25
    })
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput
  ) {
    const rest =
      await this.findRestaurantByIdAndCheckOwnership(
        owner,
        createDishInput.restaurantId
      )

    const dish = this.dishRepository.create({
      ...createDishInput,
      restaurant: rest
    })

    const saved = await this.dishRepository.save(dish)

    return saved
  }

  async editDish(
    owner: User,
    editDishInput: EditDishInput
  ) {
    const { id, ...rest } = editDishInput

    const dish = await this.dishRepository.findOne({
      where: {
        id
      },
      relations: ['restaurant']
    })

    if (!dish) {
      throw new Error('Unable to found target Dish')
    }

    if (dish.restaurant.ownerId !== owner.id) {
      throw new Error(
        'Target dish is not belongs to current user'
      )
    }
    return this.dishRepository.save({
      ...dish,
      ...rest
    })
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput
  ) {
    const dish = await this.dishRepository.findOne({
      where: {
        id: dishId
      },
      relations: ['restaurant']
    })

    if (!dish) {
      throw new Error('Unable to found target Dish')
    }

    if (dish.restaurant.ownerId !== owner.id) {
      throw new Error(
        'Target dish is not belongs to current user'
      )
    }
    return this.dishRepository.delete({
      id: dishId
    })
  }
}
