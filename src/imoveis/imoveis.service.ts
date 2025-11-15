import { Injectable } from '@nestjs/common';
import { CreateImoveiDto } from './dto/create-imovei.dto';
import { UpdateImoveiDto } from './dto/update-imovei.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ImoveisService {
  constructor(private prisma: PrismaService) {}

  async create(createImoveiDto: CreateImoveiDto) {
    return this.prisma.imovelCRM.create({
      data: createImoveiDto,
    });
  }

  async findAll() {
    return this.prisma.imovelCRM.findMany({
      orderBy: { dataCadastro: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.imovelCRM.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateImoveiDto: UpdateImoveiDto) {
    return this.prisma.imovelCRM.update({
      where: { id },
      data: updateImoveiDto,
    });
  }

  async remove(id: string) {
    return this.prisma.imovelCRM.delete({
      where: { id },
    });
  }
}
