import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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
  findAll() {
    return this.imoveisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imoveisService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateImoveiDto: UpdateImoveiDto) {
    return this.imoveisService.update(id, updateImoveiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imoveisService.remove(id);
  }
}
