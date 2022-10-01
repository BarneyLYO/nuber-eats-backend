import {
  Field,
  InputType,
  ObjectType
} from '@nestjs/graphql'
import { CoreEntity } from 'src/common/entities/core.entity'
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToOne
} from 'typeorm'
import { v4 as uuid } from 'uuid'
import { User } from './user.entity'

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
  @Column()
  @Field(() => String)
  code: string

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User

  @BeforeInsert()
  createCode() {
    this.code = uuid()
  }
}
