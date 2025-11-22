import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  ParseUUIDPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { BookingSource, PaymentStatus, ReservaStatus } from '@prisma/client';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  create(@Body() createReservaDto: CreateReservaDto) {
    return this.reservasService.create(createReservaDto);
  }

  @Get()
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skipParam: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) takeParam: number,
    @Query('status', new ParseEnumPipe(ReservaStatus, { optional: true }))
    status?: ReservaStatus,
    @Query(
      'paymentStatus',
      new ParseEnumPipe(PaymentStatus, { optional: true }),
    )
    paymentStatus?: PaymentStatus,
    @Query('origem', new ParseEnumPipe(BookingSource, { optional: true }))
    origem?: BookingSource,
    @Query('imovelId', new ParseUUIDPipe({ version: '4', optional: true }))
    imovelId?: string,
    @Query('clienteId', new ParseUUIDPipe({ version: '4', optional: true }))
    clienteId?: string,
    @Query('checkInFrom') checkInFrom?: string,
    @Query('checkInTo') checkInTo?: string,
  ) {
    const skip = Math.max(0, skipParam);
    const take = Math.min(Math.max(1, takeParam), 100);

    return this.reservasService.findAll({
      skip,
      take,
      status,
      paymentStatus,
      origem,
      imovelId,
      clienteId,
      checkInFrom: this.parseDateParam(checkInFrom, 'checkInFrom'),
      checkInTo: this.parseDateParam(checkInTo, 'checkInTo'),
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReservaDto: UpdateReservaDto,
  ) {
    return this.reservasService.update(id, updateReservaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservasService.remove(id);
  }

  private parseDateParam(value?: string, label?: string) {
    if (!value) {
      return undefined;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Parâmetro ${label ?? 'date'} inválido`);
    }
    return date;
  }
}
