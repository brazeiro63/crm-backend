import { Injectable } from '@nestjs/common';
import { CreateInteracoeDto } from './dto/create-interacoe.dto';
import { UpdateInteracoeDto } from './dto/update-interacoe.dto';

@Injectable()
export class InteracoesService {
  create(createInteracoeDto: CreateInteracoeDto) {
    return 'This action adds a new interacoe';
  }

  findAll() {
    return `This action returns all interacoes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} interacoe`;
  }

  update(id: number, updateInteracoeDto: UpdateInteracoeDto) {
    return `This action updates a #${id} interacoe`;
  }

  remove(id: number) {
    return `This action removes a #${id} interacoe`;
  }
}
