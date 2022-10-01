import {
  InputType,
  ObjectType,
  PickType
} from '@nestjs/graphql'
import { BaseOutputDto } from 'src/common/dtos/output.dto'
import { Verification } from '../entities/verification.entity'

@ObjectType()
export class VerifyEmailOutput extends BaseOutputDto {}

@InputType()
export class VerifyEmailInput extends PickType(
  Verification,
  ['code']
) {}
