import {
  ApolloDriver,
  ApolloDriverConfig
} from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { RestaurantsModule } from './restaurants/restaurants.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import {
  generateEnvSchemaValidate,
  getFromProcessEnvByPrefix,
  isENV
} from './utils/env'
import { Restaurant } from './restaurants/entities/restaurants.entity'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: isENV('dev') ? '.env.dev' : '.env.test',
      ignoreEnvFile: isENV('prod'),
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'prod')
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
        )
      })
    }),
    TypeOrmModule.forRoot({
      ...getFromProcessEnvByPrefix('DB_', (before) =>
        before.replace('DB_', '').toLowerCase()
      ),
      synchronize: !isENV('prod'), // update db when the model changes
      logging: true,
      entities: [Restaurant]
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // autoSchemaFile: join(process.cwd(), 'src/schema.gql')
      autoSchemaFile: true
    }),
    RestaurantsModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
