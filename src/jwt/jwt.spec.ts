import { Test } from '@nestjs/testing'
import { CONFIG_OPTIONS } from 'src/common/common.constants'
import { JwtService } from './jwt.service'
import * as jwt from 'jsonwebtoken'

const TEST_KEY = 'testKey'
const TOKEN = 'TOKEN'
const USER_ID = '1'

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => TOKEN),
  verify: jest.fn(() => ({ id: USER_ID }))
}))

describe('JwtService', () => {
  let service: JwtService
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            privateKey: TEST_KEY
          }
        }
      ]
    }).compile()
    service = module.get(JwtService)
  })

  it('be defined', () => {
    expect(service).toBeDefined()
  })

  describe('sign', () => {
    it('return sign token', async () => {
      const payload = {
        id: '1'
      }

      const token = service.sign(payload)
      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        TEST_KEY
      )
      expect(jwt.sign).toHaveBeenCalledTimes(1)

      expect(token).toBe(TOKEN)
    })
  })

  describe('verify', () => {
    it('should return decoded token', () => {
      const user = service.verify(TOKEN)

      expect(jwt.verify).toHaveBeenCalledTimes(1)
      expect(jwt.verify).toHaveBeenCalledWith(
        TOKEN,
        TEST_KEY
      )
      expect(user).toMatchObject({ id: USER_ID })
    })
  })
})
