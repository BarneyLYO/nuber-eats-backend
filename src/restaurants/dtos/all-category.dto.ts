import { Field, ObjectType } from '@nestjs/graphql'
import { CoreEntity } from 'src/common/entities/core.entity'
import { Category } from '../entities/category.entity'

@ObjectType()
export class AllCategoryOutput extends CoreEntity {
  @Field(() => [Category], { nullable: true })
  categories?: Category[]
}
