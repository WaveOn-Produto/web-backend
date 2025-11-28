import { Controller, Get, Param } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { Public } from 'src/auth/decorators/isPublic.decorator';

@Controller('api/pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Public()
  @Get(':serviceType/:category')
  async getPrice(
    @Param('serviceType') serviceType: string,
    @Param('category') category: string,
  ) {
    return this.pricingService.getPrice(serviceType, category);
  }
}
