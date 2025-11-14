import { Injectable } from '@nestjs/common';
import { CreateImoveiDto } from './dto/create-imovei.dto';
import { UpdateImoveiDto } from './dto/update-imovei.dto';

@Injectable()
export class ImoveisService {
  create(createImoveiDto: CreateImoveiDto) {
    return 'This action adds a new imovei';
  }

  findAll() {
    return `This action returns all imoveis`;
  }

  findOne(id: number) {
    return `This action returns a #${id} imovei`;
  }

  update(id: number, updateImoveiDto: UpdateImoveiDto) {
    return `This action updates a #${id} imovei`;
  }

  remove(id: number) {
    return `This action removes a #${id} imovei`;
  }
}
