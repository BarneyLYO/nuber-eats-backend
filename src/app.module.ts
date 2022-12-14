import {
  ApolloDriver,
  ApolloDriverConfig
} from '@nestjs/apollo'
import {
  MiddlewareConsumer,
  Module,
  NestModule
} from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import * as Joi from 'joi'
import {
  generateEnvSchemaValidate,
  getFromProcessEnvByPrefix,
  isENV
} from './utils/env'
import { UsersModule } from './users/users.module'
import { User } from './users/entities/user.entity'
import { JwtModule } from './jwt/jwt.module'
import { Verification } from './users/entities/verification.entity'
import { DataSource } from 'typeorm'
import { Restaurant } from './restaurants/entities/restaurants.entity'
import { Category } from './restaurants/entities/category.entity'
import { RestaurantsModule } from './restaurants/restaurants.module'
import { AuthModule } from './auth/auth.module'
import { Dish } from './restaurants/entities/dish.entity'
import { OrdersModule } from './orders/orders.module'
import {
  Order,
  OrderItem
} from './orders/entities/order.entity'
import { CommonModule } from './common/common.module'
import { PaymentModule } from './payment/payment.module'
import { Payment } from './payment/entities/payment.entity'

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: isENV('dev') ? '.env.dev' : '.env.test',
      ignoreEnvFile: isENV('prod'),
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'prod', 'test')
          .required(),
        ...generateEnvSchemaValidate(
          [
            'type',
            'host',
            'port',
            'username',
            'password',
            'database'
          ],
          'DB_'
        ),
        PRIVATE_KEY: Joi.string().required()
      })
    }),
    TypeOrmModule.forRoot({
      ...getFromProcessEnvByPrefix('DB_', (before) =>
        before.replace('DB_', '').toLowerCase()
      ),
      synchronize: !isENV('prod'), // update db when the model changes
      logging: false,
      entities: [
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
        Payment
      ]
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      installSubscriptionHandlers: true,

      // autoSchemaFile: join(process.cwd(), 'src/schema.gql')
      autoSchemaFile: true,
      context: ({ req, connection }) => {
        const TOKEN_KEY = 'x-jwt'
        // delegate the whole thing to the guard
        if (req) {
          return { token: req.headers[TOKEN_KEY] }
        } else if (connection) {
          return { token: connection.context[TOKEN_KEY] }
        }
        return { token: null }
      }
    }),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY
    }),
    ScheduleModule.forRoot(),
    RestaurantsModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    PaymentModule
  ],
  controllers: [],
  providers: []
})
export class AppModule implements NestModule {
  constructor(private readonly dataSource: DataSource) {}

  public getDataSource(): DataSource {
    return this.dataSource
  }

  configure(_consumer: MiddlewareConsumer) {
    // middleware only applies to http middleware only applies to
    // consumer.apply(JwtMiddleware).forRoutes({
    //   path: '*',
    //   method: RequestMethod.ALL
    // })
  }
}
