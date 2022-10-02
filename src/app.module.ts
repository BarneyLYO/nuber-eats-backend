import {
  ApolloDriver,
  ApolloDriverConfig
} from '@nestjs/apollo'
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod
} from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import {
  generateEnvSchemaValidate,
  getFromProcessEnvByPrefix,
  isENV
} from './utils/env'
import { UsersModule } from './users/users.module'
import { User } from './users/entities/user.entity'
import { JwtModule } from './jwt/jwt.module'
import { JwtMiddleware } from './jwt/jwt.middleware'
import { Verification } from './users/entities/verification.entity'
import { DataSource } from 'typeorm'
import { Restaurant } from './restaurants/entities/restaurants.entity'
import { Category } from './restaurants/entities/category.entity'
import { RestaurantsModule } from './restaurants/restaurants.module'
import { AuthModule } from './auth/auth.module'
import { Dish } from './restaurants/entities/dish.entity'

@Module({
  imports: [
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
        // Restaurant
        User,
        Verification,
        Restaurant,
        Category,
        Dish
      ]
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // autoSchemaFile: join(process.cwd(), 'src/schema.gql')
      autoSchemaFile: true,
      context: ({ req }) => ({ user: req['user'] })
    }),

    RestaurantsModule,
    UsersModule,
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY
    }),
    AuthModule
  ],
  controllers: [],
  providers: []
})
export class AppModule implements NestModule {
  constructor(private readonly dataSource: DataSource) {}

  public getDataSource(): DataSource {
    return this.dataSource
  }

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL
    })
  }
}
