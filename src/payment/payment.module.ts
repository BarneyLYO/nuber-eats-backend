import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Restaurant } from 'src/restaurants/entities/restaurants.entity'
import { Payment } from './entities/payment.entity'
import { PaymentService } from './payment.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Restaurant])
  ],
  providers: [PaymentService]
})
export class PaymentModule {}
