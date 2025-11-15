import { Injectable } from '@nestjs/common';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContratosService {
  constructor(private prisma: PrismaService) {}

  async create(createContratoDto: CreateContratoDto) {
    return this.prisma.contratoGerado.create({
      data: createContratoDto as any,
    });
  }

  async findAll() {
    return this.prisma.contratoGerado.findMany({
      include: {
        cliente: true,
        gerador: true,
      },
      orderBy: { geradoEm: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.contratoGerado.findUnique({
      where: { id },
      include: {
        cliente: true,
        gerador: true,
        interacoes: true,
      },
    });
  }

  async update(id: string, updateContratoDto: UpdateContratoDto) {
    return this.prisma.contratoGerado.update({
      where: { id },
      data: updateContratoDto,
    });
  }

  async remove(id: string) {
    return this.prisma.contratoGerado.delete({
      where: { id },
    });
  }
}
