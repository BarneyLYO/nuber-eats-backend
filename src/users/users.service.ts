import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateAccountInput } from './dtos/create-account.dto'
import { LoginInput } from './dtos/login.dto'
import { User } from './entities/user.entity'
import { JwtService } from 'src/jwt/jwt.service'
import { EditProfileInput } from './dtos/edit-profile.dto'
import { Verification } from './entities/verification.entity'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
    private readonly jwtService: JwtService
  ) {}

  async createAccount({
    email,
    password,
    role
  }: CreateAccountInput) {
    try {
      const exists = await this.userRepository.findOneBy({
        email
      })
      if (exists) {
        return [
          false,
          `There is an user with that email already`
        ]
      }
      const entity = this.userRepository.create({
        email,
        password,
        role
      })

      const user = await this.userRepository.save(entity)

      await this.verificationRepository.save(
        this.verificationRepository.create({
          user
        })
      )
      return [true]
    } catch (e) {
      return [false, `Couldn't create account `]
    }

    // check if is new user
    // yes create account & hashpassword
    // no return error object
  }

  async login({ email, password }: LoginInput) {
    // check if the password is correct
    // make a jwt and give it to the user
    try {
      const user = await this.userRepository.findOne({
        select: [
          'createdAt',
          'email',
          'id',
          'password',
          'role',
          'updatedAt',
          'verified'
        ],
        where: {
          email
        }
      })
      if (!user) {
        return {
          ok: false,
          error: 'User not found'
        }
      }

      const passwordMatch = await user.checkPassword(
        password
      )

      if (!passwordMatch) {
        return {
          ok: false,
          error: 'incorrect password'
        }
      }

      return {
        ok: true,
        token: this.jwtService.sign({
          id: user.id
        })
      }
    } catch (e) {
      return {
        ok: false,
        error: e
      }
    }
  }

  async editProfile(
    userId: string,
    { email, password }: EditProfileInput
  ) {
    const user: User = await this.userRepository.findOneBy({
      id: userId
    })
    if (email) {
      user.email = email
      user.verified = false
      await this.verificationRepository.delete({
        user: { id: userId }
      })
      await this.verificationRepository.save(
        this.verificationRepository.create({ user })
      )
    }
    if (password) {
      user.password = password
    }
    return this.userRepository.save(user)
  }

  async findById(id: string) {
    return this.userRepository.findOneOrFail({
      where: { id }
    })
  }

  async verifyEmail(code: string) {
    try {
      const verification =
        await this.verificationRepository.findOne({
          relations: ['user'],
          where: [{ code }]
        })
      if (verification) {
        verification.user.verified = true
        this.userRepository.save(verification.user)
        this.verificationRepository.delete(verification.id)
        return true
      }
      throw new Error('Unable to verify user')
    } catch (e) {
      console.log(e)
      return false
    }
  }
}
