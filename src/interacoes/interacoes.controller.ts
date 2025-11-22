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
  ParseEnumPipe,
} from '@nestjs/common';
import { CategoriaInteracao, TipoInteracao } from '@prisma/client';
import { InteracoesService } from './interacoes.service';
import { CreateInteracoeDto } from './dto/create-interacoe.dto';
import { UpdateInteracoeDto } from './dto/update-interacoe.dto';

@Controller('interacoes')
export class InteracoesController {
  constructor(private readonly interacoesService: InteracoesService) {}

  @Post()
  create(@Body() createInteracoeDto: CreateInteracoeDto) {
    return this.interacoesService.create(createInteracoeDto);
  }

  @Get()
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skipParam: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) takeParam: number,
    @Query('tipo', new ParseEnumPipe(TipoInteracao, { optional: true }))
    tipo?: TipoInteracao,
    @Query(
      'categoria',
      new ParseEnumPipe(CategoriaInteracao, { optional: true }),
    )
    categoria?: CategoriaInteracao,
    @Query('clienteId') clienteId?: string,
  ) {
    const skip = Math.max(0, skipParam);
    const take = Math.min(Math.max(1, takeParam), 100);

    return this.interacoesService.findAll(
      skip,
      take,
      tipo,
      categoria,
      clienteId,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.interacoesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInteracoeDto: UpdateInteracoeDto,
  ) {
    return this.interacoesService.update(id, updateInteracoeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.interacoesService.remove(id);
  }
}
