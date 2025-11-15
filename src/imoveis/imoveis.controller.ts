import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ImoveisService } from './imoveis.service';
import { CreateImoveiDto } from './dto/create-imovei.dto';
import { UpdateImoveiDto } from './dto/update-imovei.dto';

@Controller('imoveis')
export class ImoveisController {
  constructor(private readonly imoveisService: ImoveisService) {}

  @Post()
  create(@Body() createImoveiDto: CreateImoveiDto) {
    return this.imoveisService.create(createImoveiDto);
  }

  @Get()
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skipParam: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) takeParam: number,
    @Query('tipo') tipo?: string,
  ) {
    const skip = Math.max(0, skipParam);
    const take = Math.min(Math.max(1, takeParam), 100);

    return this.imoveisService.findAll(skip, take, tipo);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.imoveisService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateImoveiDto: UpdateImoveiDto) {
    return this.imoveisService.update(id, updateImoveiDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.imoveisService.remove(id);
  }
}
