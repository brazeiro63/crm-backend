import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  NotFoundException,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { StaysClientesFilters } from '../stays/stays.service';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skipParam: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) takeParam: number,
    @Query('tag') tag?: string,
    @Query('origem') origem?: string,
  ) {
    const skip = Math.max(0, skipParam);
    const take = Math.min(Math.max(1, takeParam), 100);

    return this.clientesService.findAll(skip, take, tag, origem);
  }

  @Post('sync')
  syncFromStays(
    @Body('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {
    return this.clientesService.syncFromStays(limit);
  }

  /**
   * Endpoints temporários para listar clientes direto da Stays
   * Mantêm compatibilidade com o frontend atual enquanto o CRM é sincronizado
   */
  @Get('stays')
  findAllFromStays(
    @Query('hasReservations') hasReservations?: string,
    @Query('reservationFilter') reservationFilter?: 'arrival' | 'departure',
    @Query('reservationFrom') reservationFrom?: string,
    @Query('reservationTo') reservationTo?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) pageParam?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limitParam?: number,
  ) {
    const filters: StaysClientesFilters = {};

    if (hasReservations !== undefined) {
      filters.hasReservations = hasReservations === 'true';
    }
    if (reservationFilter) {
      filters.reservationFilter = reservationFilter;
    }
    if (reservationFrom) {
      filters.reservationFrom = reservationFrom;
    }
    if (reservationTo) {
      filters.reservationTo = reservationTo;
    }

    const page = Math.max(pageParam ?? 1, 1);
    const limit = Math.min(Math.max(limitParam ?? 20, 1), 100);

    return this.clientesService.findAllFromStays(filters, page, limit);
  }

  @Get('stays/:id')
  async findOneFromStays(@Param('id') id: string) {
    const cliente = await this.clientesService.findOneFromStays(id);

    if (!cliente) {
      throw new NotFoundException('Cliente não encontrado na Stays');
    }

    return cliente;
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clientesService.update(id, updateClienteDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clientesService.remove(id);
  }
}
