import { UseGuards } from '@nestjs/common'
import {
  Args,
  Mutation,
  Query,
  Resolver
} from '@nestjs/graphql'
import { AuthUser } from 'src/auth/auth-user.decorator'
import { AuthGuard } from 'src/auth/auth.guard'
import {
  CreateAccountInput,
  CreateAccountOutput
} from './dtos/create-account.dto'
import {
  EditProfileInput,
  EditProfileOutput
} from './dtos/edit-profile.dto'
import { LoginInput, LoginOutput } from './dtos/login.dto'
import {
  UserProfileInput,
  userProfileOutput
} from './dtos/use-profile.dto'
import {
  VerifyEmailInput,
  VerifyEmailOutput
} from './dtos/verify-email.dto'
import { User } from './entities/user.entity'
import { UsersService } from './users.service'

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}

  @Query(() => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser: User) {
    return authUser
  }

  @Query(() => userProfileOutput)
  @UseGuards(AuthGuard)
  async userProfile(
    @Args() userProfileInput: UserProfileInput
  ) {
    try {
      const user = await this.userService.findById(
        userProfileInput.userId
      )

      if (!user) {
        throw new Error('User No found')
      }
      return {
        ok: !!user,
        user
      }
    } catch (e) {
      return {
        error: 'User No found',
        ok: false
      }
    }
  }

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput
  ) {
    try {
      const [ok, error] =
        await this.userService.createAccount(
          createAccountInput
        )
      return {
        ok,
        error
      }
    } catch (e) {
      return {
        ok: false,
        error: e
      }
    }
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput) {
    try {
      return await this.userService.login(loginInput)
    } catch (error) {
      return {
        ok: false,
        error
      }
    }
  }

  @UseGuards(AuthGuard)
  @Mutation(() => EditProfileOutput)
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput
  ) {
    try {
      await this.userService.editProfile(
        authUser.id,
        editProfileInput
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

  @Mutation(() => VerifyEmailOutput)
  async verifyEmail(
    @Args('input') verifyEmailInput: VerifyEmailInput
  ) {
    try {
      const verify = await this.userService.verifyEmail(
        verifyEmailInput.code
      )
      if (verify) {
        return {
          ok: true
        }
      }
      return {
        ok: false,
        error: 'unable to verify the user'
      }
    } catch (e) {
      return {
        ok: false,
        error: String(e)
      }
    }
  }
}
