import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { JwtService } from 'src/jwt/jwt.service'
import { Repository } from 'typeorm'
import { User, UserRole } from './entities/user.entity'
import { Verification } from './entities/verification.entity'
import { UsersService } from './users.service'

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneBy: jest.fn(),
  findOneByOrFail: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn()
})

const mockJwtService = () => ({
  sign: jest.fn(),
  verify: jest.fn()
})
type MockRepository<T = any> = Record<
  keyof Repository<T>,
  jest.Mock
>

describe('UserService', () => {
  let service: UsersService
  let userRepository: Partial<MockRepository<User>>
  let verificationRepository: Partial<MockRepository<User>>
  let jwtService: ReturnType<typeof mockJwtService>
  beforeEach(async () => {
    jwtService = mockJwtService()
    const modules = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository()
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository()
        },
        {
          provide: JwtService,
          useValue: jwtService
        }
      ]
    }).compile()
    service = modules.get<UsersService>(UsersService)
    userRepository = modules.get(getRepositoryToken(User))
    verificationRepository = modules.get(
      getRepositoryToken(Verification)
    )
  })

  it('UserService to be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createAccount', () => {
    const createAccountArgument = {
      email: 'abcd@email.com',
      password: 'adadasd',
      role: UserRole.Client
    }

    it('should fail if user exists', async () => {
      userRepository.findOneBy.mockResolvedValue({
        id: 'aaaaa',
        email: 'abcd@email.com'
      })

      const [ok] = await service.createAccount(
        createAccountArgument
      )

      expect(ok).toBeFalsy()
    })

    it('should create an user', async () => {
      userRepository.findOneBy.mockResolvedValue(null)
      userRepository.create.mockReturnValue(
        createAccountArgument
      )
      verificationRepository.save.mockResolvedValue(
        createAccountArgument
      )
      verificationRepository.create.mockReturnValue(
        createAccountArgument
      )
      const [ok] = await service.createAccount(
        createAccountArgument
      )
      expect(userRepository.create).toHaveBeenCalledTimes(1)
      expect(userRepository.create).toBeCalledWith(
        createAccountArgument
      )
      expect(userRepository.save).toHaveBeenCalledTimes(1)
      expect(ok).toBeTruthy()
    })

    it('should throw an exception', async () => {
      userRepository.findOneBy.mockRejectedValue('lala')
      const [ok] = await service.createAccount(
        createAccountArgument
      )

      expect(ok).toBeFalsy()
    })
  })

  describe('login', () => {
    const loginInput = {
      email: 'abcd@email.com',
      password: 'adadasda'
    }

    it('login user no found', async () => {
      userRepository.findOne.mockResolvedValue(null)
      const result = await service.login(loginInput)
      expect(result).toMatchObject({
        ok: false,
        error: 'User not found'
      })
    })

    it('login failed', async () => {
      const userEntityRtn = {
        id: '1',
        checkPassword: jest.fn(() => Promise.resolve(false))
      }
      userRepository.findOne.mockResolvedValue(
        userEntityRtn
      )
      const result = await service.login(loginInput)
      expect(result).toMatchObject({
        ok: false,
        error: 'incorrect password'
      })
    })

    it('login pass', async () => {
      const userEntityRtn = {
        id: '1aaaa',
        checkPassword: jest.fn(() => Promise.resolve(true))
      }

      jwtService.sign.mockReturnValue('a1b2c3d4')

      userRepository.findOne.mockResolvedValue(
        userEntityRtn
      )
      const result = await service.login(loginInput)
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: expect.any(String)
      })
      expect(result).toMatchObject({
        ok: true,
        token: 'a1b2c3d4'
      })
    })
  })

  describe('findById', () => {
    const user: User = new User()
    user.id = '1'

    it('should find an existing user', async () => {
      userRepository.findOneOrFail.mockResolvedValue(user)
      const result = await service.findById('id')
      expect(result).toMatchObject(user)
    })
    it('should not find an user', async () => {
      userRepository.findOneOrFail.mockResolvedValue(null)
      const result = await service.findById('id')
      expect(result).toBeNull()
    })
  })

  describe('editProfile', () => {
    const oldUser = new User()
    oldUser.email = 'aaa@aaa.com'
    oldUser.verified = true
    oldUser.password = 'bbbb'

    it('should change email', async () => {
      userRepository.findOneBy.mockResolvedValue(oldUser)
      const newUser = new User()

      newUser.email = 'cccc@cccc.com'
      newUser.verified = false
      newUser.password = oldUser.password

      userRepository.save.mockResolvedValue(newUser)

      const res = await service.editProfile('1', {
        email: newUser.email
      })

      expect(res.email).toBe(newUser.email)
      expect(res.verified).toBeFalsy()
    })

    it('should change password', async () => {
      userRepository.findOneBy.mockResolvedValue(oldUser)
      const newUser = new User()

      newUser.verified = true
      newUser.password = 'asdadasd'

      userRepository.save.mockResolvedValue(newUser)

      const res = await service.editProfile('1', {
        password: newUser.password
      })

      expect(res.password).toBe(newUser.password)
      expect(res.verified).toBeTruthy()
    })

    it('should change password and email', async () => {
      userRepository.findOneBy.mockResolvedValue(oldUser)
      const newUser = new User()

      newUser.password = 'asdadasd'
      newUser.email = 'aaaa@dddd.com'

      userRepository.save.mockResolvedValue(newUser)

      const res = await service.editProfile('1', {
        password: newUser.password,
        email: newUser.email
      })

      expect(res.password).toBe(newUser.password)
      expect(res.verified).toBeFalsy()
      expect(res.email).toBe(newUser.email)
    })
  })
  it.todo('verifyEmail')
})
