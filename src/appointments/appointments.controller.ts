import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Req,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/admin.guard';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

@Controller('api/appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly apService: AppointmentsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateAppointmentDto) {
    return this.apService.create(req.user.sub, dto);
  }

  @Get('my')
  getMine(@Req() req: any) {
    return this.apService.getMyAppointments(req.user.sub);
  }

  @Get('available-slots')
  getAvailableSlots(@Query('date') date: string) {
    return this.apService.getAvailableSlots(date);
  }

  @Patch(':id/cancel')
  cancel(@Req() req: any, @Param('id') id: string) {
    return this.apService.cancel(req.user.sub, id);
  }

  @Patch(':id/reschedule')
  reschedule(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    return this.apService.reschedule(req.user.sub, id, dto);
  }

  @Get(':id/repeat')
  repeat(@Req() req: any, @Param('id') id: string) {
    return this.apService.repeat(req.user.sub, id);
  }

  // ========== ROTAS ADMIN ==========

  @Get('admin/all')
  @UseGuards(AdminGuard)
  async getAllForAdmin() {
    return this.apService.getAllForAdmin();
  }

  @Patch(':id/observations')
  @UseGuards(AdminGuard)
  async updateObservations(
    @Param('id') id: string,
    @Body() body: { observations: string }
  ) {
    return this.apService.updateObservations(id, body.observations);
  }

  @Patch(':id/complete')
  @UseGuards(AdminGuard)
  async completeAppointment(@Param('id') id: string) {
    return this.apService.complete(id);
  }
}