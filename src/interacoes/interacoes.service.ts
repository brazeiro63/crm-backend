import { Injectable } from '@nestjs/common';
import { CreateInteracoeDto } from './dto/create-interacoe.dto';
import { UpdateInteracoeDto } from './dto/update-interacoe.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InteracoesService {
  constructor(private prisma: PrismaService) {}

  async create(createInteracoeDto: CreateInteracoeDto) {
    return this.prisma.interacao.create({
      data: createInteracoeDto,
    });
  }

  async findAll() {
    return this.prisma.interacao.findMany({
      include: {
        cliente: true,
        contrato: true,
        registrador: true,
      },
      orderBy: { dataHora: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.interacao.findUnique({
      where: { id },
      include: {
        cliente: true,
        contrato: true,
        registrador: true,
      },
    });
  }

  async update(id: string, updateInteracoeDto: UpdateInteracoeDto) {
    return this.prisma.interacao.update({
      where: { id },
      data: updateInteracoeDto,
    });
  }

  async remove(id: string) {
    return this.prisma.interacao.delete({
      where: { id },
    });
  }
}
