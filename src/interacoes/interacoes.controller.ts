import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
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
  findAll() {
    return this.interacoesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.interacoesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateInteracoeDto: UpdateInteracoeDto) {
    return this.interacoesService.update(id, updateInteracoeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.interacoesService.remove(id);
  }
}
