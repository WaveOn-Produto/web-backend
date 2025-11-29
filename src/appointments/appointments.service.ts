import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { addDays, isBefore, isAfter, isSameDay, differenceInMinutes } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  private diffMinutes(a: string, b: string) {
    const [h1, m1] = a.split(':').map(Number);
    const [h2, m2] = b.split(':').map(Number);

    return Math.abs((h1 * 60 + m1) - (h2 * 60 + m2));
  }

  private validateDate(dateString: string) {
    const date = parseISO(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDate = addDays(today, 1);
    const maxDate = addDays(today, 7);

    if (isSameDay(date, today)) {
      throw new BadRequestException('Não é permitido agendar no dia de hoje.');
    }

    if (isBefore(date, minDate) || isAfter(date, maxDate)) {
      throw new BadRequestException('A data deve estar entre 1 e 7 dias.');
    }
  }

  async create(userId: string, dto: CreateAppointmentDto) {
    const { serviceType, date, time, carId, addressId, vehicleCategory } = dto;

    this.validateDate(date);

    // Verifica se carro pertence ao usuário
    const car = await this.prisma.car.findUnique({ where: { id: carId } });
    if (!car || car.userId !== userId) {
      throw new BadRequestException('Carro inválido.');
    }

    // Verifica se endereço pertence ao usuário
    const address = await this.prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== userId) {
      throw new BadRequestException('Endereço inválido.');
    }

    // Verifica preço
    const pricing = await this.prisma.pricing.findFirst({
      where: {
        serviceType,
        vehicleCategory,
      }
    });

    if (!pricing) {
      throw new BadRequestException('Preço não encontrado para essa categoria.');
    }

    // Verificar conflito com outros horários
    const existing = await this.prisma.appointment.findMany({
      where: { date: parseISO(date) },
    });

    for (const ap of existing) {
      if (this.diffMinutes(ap.time, time) < 240) {
        throw new BadRequestException('Horário conflita com outro agendamento.');
      }
    }

    return this.prisma.appointment.create({
      data: {
        serviceType,
        date: parseISO(date),
        time,
        priceCents: pricing.priceCents,
        userId,
        carId,
        addressId,
      },
    });
  }

  async getAvailableSlots(dateString: string) {
    const date = parseISO(dateString);
    
    // Busca todos os agendamentos do dia
    const appointments = await this.prisma.appointment.findMany({
      where: { 
        date,
        status: 'SCHEDULED' // Apenas agendamentos ativos
      },
      select: {
        time: true
      }
    });

    const bookedSlots = appointments.map(ap => ap.time);

    return { bookedSlots };
  }

  async getMyAppointments(userId: string) {
    return this.prisma.appointment.findMany({
      where: { userId },
      include: {
        car: true,
        address: true,
      },
      orderBy: { date: 'asc' }
    });
  }

  async cancel(userId: string, id: string) {
    const ap = await this.prisma.appointment.findUnique({ where: { id } });

    if (!ap || ap.userId !== userId) {
      throw new NotFoundException('Agendamento não encontrado.');
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  async reschedule(userId: string, id: string, dto: RescheduleAppointmentDto) {
    const ap = await this.prisma.appointment.findUnique({ where: { id } });

    if (!ap || ap.userId !== userId) {
      throw new NotFoundException('Agendamento não encontrado.');
    }

    this.validateDate(dto.date);

    // verificar conflitos novamente
    const sameDay = await this.prisma.appointment.findMany({
      where: { date: parseISO(dto.date) },
    });

    for (const a of sameDay) {
      if (this.diffMinutes(a.time, dto.time) < 240) {
        throw new BadRequestException('Horário indisponível.');
      }
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        date: parseISO(dto.date),
        time: dto.time,
        status: 'SCHEDULED',
      }
    });
  }

  async repeat(userId: string, id: string) {
    const ap = await this.prisma.appointment.findUnique({ where: { id } });

    if (!ap || ap.userId !== userId) {
      throw new NotFoundException('Agendamento não encontrado.');
    }

    // copia o agendamento com a data nova
    return {
      serviceType: ap.serviceType,
      vehicleCategory: (await this.prisma.car.findUnique({ where: { id: ap.carId } }))!.category,
      carId: ap.carId,
      addressId: ap.addressId
    };
  }
}