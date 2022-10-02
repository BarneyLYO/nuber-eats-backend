import { Repository, EntityRepository } from 'typeorm'
import { Category } from '../entities/category.entity'

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async findOrCreate(
    categoryName: string,
    categorySlug: string = categoryName.replace(/ /g, '-')
  ) {
    let category = await this.findOne({
      where: {
        slug: categorySlug
      }
    })

    if (!category) {
      category = await this.save(
        this.create({
          slug: categorySlug,
          name: categoryName
        })
      )
    }

    return category
  }
}
