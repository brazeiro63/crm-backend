import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ContratosService } from './contratos.service';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';

@Controller('contratos')
export class ContratosController {
  constructor(private readonly contratosService: ContratosService) {}

  @Post()
  create(@Body() createContratoDto: CreateContratoDto) {
    return this.contratosService.create(createContratoDto);
  }

  @Get()
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skipParam: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) takeParam: number,
    @Query('tipo') tipo?: string,
    @Query('status') status?: string,
  ) {
    const skip = Math.max(0, skipParam);
    const take = Math.min(Math.max(1, takeParam), 100);

    return this.contratosService.findAll(skip, take, tipo, status);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contratosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateContratoDto: UpdateContratoDto) {
    return this.contratosService.update(id, updateContratoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contratosService.remove(id);
  }
}
