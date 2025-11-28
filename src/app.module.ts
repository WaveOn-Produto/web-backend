import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CarsModule } from './cars/cars.module';
import { AddressesModule } from './addresses/addresses.module';
import { PricingModule } from './pricing/pricing.module';
import { SlotsModule } from './slots/slots.module';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    CarsModule,
    AddressesModule,
    PricingModule,
    SlotsModule,
    AppointmentsModule,
  ],
})
export class AppModule {}



