import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from 'src/users/entities/user.entity'
import { Like, Raw, Repository } from 'typeorm'
import { CategoryService } from './category.service'
import { CreateRestaurantInput } from './dtos/create-restaurant.dto'
import { DeleteRestaurantInput } from './dtos/delete-restaurant.dts'
import { EditRestaurantInput } from './dtos/edit-restaurant.dto'
import {
  RestaurantInput,
  RestaurantsInput
} from './dtos/restaurants.dto'
import { SearchRestaurantInput } from './dtos/search-restaurant.dto'
import { Category } from './entities/category.entity'
import { Restaurant } from './entities/restaurants.entity'

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    // @InjectRepository(Category)
    // private readonly categoryRepository: Repository<Category>,
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
    const restaurant =
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
      relations: ['owner']
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
}
