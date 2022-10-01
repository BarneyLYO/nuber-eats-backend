import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import { AppModule } from '../src/app.module'
import { graphqlOf } from './util/request'
import { Repository } from 'typeorm'
import { User } from 'src/users/entities/user.entity'
import { getRepositoryToken } from '@nestjs/typeorm'

let EMAIL = 'abcd@email.com'
const PASSWORD = '12345'

describe('AppController (e2e)', () => {
  let app: INestApplication
  let appModule: AppModule
  let server = null
  let userRepository: Repository<User>
  let jwtToken: string = null

  beforeAll(async () => {
    const moduleFixture: TestingModule =
      await Test.createTestingModule({
        imports: [AppModule]
      }).compile()

    app = moduleFixture.createNestApplication()
    appModule = moduleFixture.get(AppModule)
    userRepository = moduleFixture.get(
      getRepositoryToken(User)
    )
    await app.init()
    server = app.getHttpServer()
  })

  afterAll(async () => {
    await appModule.getDataSource().dropDatabase()
    await app.close()
  })

  describe('Env Init', () => {
    it('module fixture should be defined', () => {
      expect(app).toBeDefined()
      expect(appModule).toBeDefined()
    })
  })

  describe('createAccount', () => {
    it('should create account', async () => {
      const testCase = graphqlOf(
        `mutation {
            createAccount(
              input: { email: "${EMAIL}", password: "12345", role: Owner }
            ) {
              ok
              error
            }
          }`
      )

      testCase.for((res) => {
        const data = res.body.data
        expect(data).toBeDefined()
        expect(data.createAccount.ok).toBeTruthy()
        expect(data.createAccount.error).toBeNull()
      })

      await testCase.go(server)
    })

    it('should fail with same email', async () => {
      const testCase = graphqlOf(
        `mutation {
            createAccount(
              input: { email: "${EMAIL}", password: "${PASSWORD}", role: Owner }
            ) {
              ok
              error
            }
          }`
      )

      testCase.for((res) => {
        const data = res.body.data
        expect(data).toBeDefined()
        expect(data.createAccount.ok).toBeFalsy()
        expect(data.createAccount.error).toBe(
          'There is an user with that email already'
        )
      })

      await testCase.go(server)
    })
  })

  describe('login', () => {
    it('should login with correct credentials', async () => {
      const testCase = graphqlOf(
        `
        mutation {
          login(input:{
            email:"${EMAIL}",
            password:"${PASSWORD}"
          }){
            error,
            ok,
            token
          }
        }
        `
      )
      testCase.for((res) => {
        const data = res.body?.data
        expect(data).toBeDefined()
        const login = data.login
        expect(login.ok).toBeTruthy()
        expect(login.token).toEqual(expect.any(String))
        expect(login.error).toBeNull()

        jwtToken = login.token
      })

      await testCase.go(server)
    })

    it('should not be login with credentials by wrong password', async () => {
      const testCase = graphqlOf(
        `
        mutation {
          login(input:{
            email:"${EMAIL}",
            password:"${PASSWORD + 'asdasdas'}"
          }){
            error,
            ok,
            token
          }
        }
        `
      )
      testCase.for((res) => {
        const data = res.body?.data
        expect(data).toBeDefined()
        const login = data.login
        expect(login.ok).toBeFalsy()
        expect(login.token).toBeNull()
        expect(login.error).toStrictEqual(
          'incorrect password'
        )
      })

      await testCase.go(server)
    })
  })

  describe('userProfile', () => {
    let userId: string
    beforeAll(async () => {
      const [user] = await userRepository.find()
      userId = user.id
    })

    it('should see a user profile', async () => {
      const testCase = graphqlOf(
        `
        {
          userProfile(userId:"${userId}") {
            ok
            error
            user{
              id
            }
          }
        }
        `
      )

      testCase.for(({ body }) => {
        expect(body.data).not.toBeNull()
        const data = body.data.userProfile
        expect(data.ok).toBeTruthy()
        expect(data.error).toBeNull()
        expect(data.user).toBeDefined()

        const { user } = data
        expect(user.id).toBe(userId)
      })

      await testCase.go(
        server,
        new Map([['X-JWT', jwtToken]])
      )
    })

    it('should not find a user profile', async () => {
      const testCase = graphqlOf(
        `
        {
          userProfile(userId:"${userId + 'asdasda'}") {
            ok
            error
            user{
              id
            }
          }
        }
        `
      )

      testCase.for(({ body }) => {
        expect(body.data).not.toBeNull()
        const data = body.data.userProfile
        expect(data.ok).toBeFalsy()
        expect(data.error).toBe('User No found')
      })

      await testCase.go(
        server,
        new Map([['X-JWT', jwtToken]])
      )
    })
  })

  describe('me', () => {
    it('should find my profile', async () => {
      const testCase = graphqlOf(
        `
        {
          me{
            email
          }
        }
        `
      )

      testCase.for(({ body }) => {
        expect(body.data).not.toBeNull()
        const data = body.data.me
        expect(data.email).toBe(EMAIL)
      })

      await testCase.go(
        server,
        new Map([['X-JWT', jwtToken]])
      )
    })

    it('should not find my profile', async () => {
      const testCase = graphqlOf(
        `
        {
          me{
            email,
          }
        }
        `
      )

      testCase.for(({ body }) => {
        expect(body.errors).not.toBeNull()
      })

      await testCase.go(server)
    })
  })

  describe('editProfile', () => {
    it('should change email', async () => {
      const NEW_EMAL = 'aaaa@email.com'
      const testCase = graphqlOf(`
          mutation {
            editProfile(input:{
              email:"${NEW_EMAL}"
            }) {
              ok,error
            }
          }
        `)

      testCase.for(({ body }) => {
        expect(body.data).toBeDefined()
        const data = body.data.editProfile
        expect(data.ok).toBeTruthy()
        expect(data.error).toBeNull()
        EMAIL = NEW_EMAL
      })

      await testCase.go(
        server,
        new Map([['X-JWT', jwtToken]])
      )
    })

    it('should have new email now', async () => {
      const testCase = graphqlOf(
        `
        {
          me{
            email
          }
        }
        `
      )

      testCase.for(({ body }) => {
        expect(body.data).not.toBeNull()
        const data = body.data.me
        expect(data.email).toBe(EMAIL)
      })

      await testCase.go(
        server,
        new Map([['X-JWT', jwtToken]])
      )
    })

    it('should change password', async () => {
      const testCase = graphqlOf(`
          mutation {
            editProfile(input:{
              password:"12345678"
            }) {
              ok,error
            }
          }
        `)

      testCase.for(({ body }) => {
        expect(body.data).toBeDefined()
        const data = body.data.editProfile
        expect(data.ok).toBe(true)
        expect(data.error).toBeNull()
      })

      await testCase.go(
        server,
        new Map([['X-JWT', jwtToken]])
      )
    })
  })
})
