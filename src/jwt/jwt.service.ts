import { Inject, Injectable } from '@nestjs/common'
import { JwtModuleOptions } from './jwt.interfaces'
import * as JWT from 'jsonwebtoken'
import { CONFIG_OPTIONS } from 'src/common/common.constants'

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS)
    private readonly options: JwtModuleOptions
  ) {}
  sign(payload: object) {
    return JWT.sign(payload, this.options.privateKey)
  }
  verify(token: string) {
    return JWT.verify(token, this.options.privateKey)
  }
}
