import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CategoryInput } from './dtos/category.dto'
import { Category } from './entities/category.entity'
import { Restaurant } from './entities/restaurants.entity'

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>
  ) {}

  async findOrCreateCategory(
    categoryName: string,
    categorySlug: string = categoryName.replace(/ /g, '-')
  ) {
    let category = await this.categoryRepository.findOne({
      where: {
        slug: categorySlug
      }
    })

    if (!category) {
      category = await this.categoryRepository.save(
        this.categoryRepository.create({
          slug: categorySlug,
          name: categoryName
        })
      )
    }

    return category
  }

  async allCategories() {
    const categories = await this.categoryRepository.find(
      {}
    )
    return categories
  }

  async countRestaurant(category: Category) {
    return await this.restaurantRepository.count({
      where: {
        category: {
          id: category.id
        }
      }
    })
  }

  async findCategoryBySlug({ slug, page }: CategoryInput) {
    const category = await this.categoryRepository.findOne({
      where: {
        slug
      }
      // relations: ['restaurants'] will load all relationship
    })

    if (!category) {
      throw new Error('Category not found')
    }

    const restaurants =
      await this.restaurantRepository.find({
        where: {
          category: {
            id: category.id
          }
        },
        take: 25,
        skip: (page - 1) * 25,
        order: {
          isPromoted: 'DESC'
        }
      })

    category.restaurants = restaurants

    return category
  }
}
