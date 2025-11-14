import { Injectable } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto) {
    return this.prisma.clienteCRM.create({
      data: createClienteDto,
    });
  }

  async findAll() {
    return this.prisma.clienteCRM.findMany({
      orderBy: { dataCadastro: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.clienteCRM.findUnique({
      where: { id },
      include: {
        contratos: true,
        interacoes: {
          orderBy: { dataHora: 'desc' },
          take: 10,
        },
      },
    });
  }

  async update(id: string, updateClienteDto: UpdateClienteDto) {
    return this.prisma.clienteCRM.update({
      where: { id },
      data: updateClienteDto,
    });
  }

  async remove(id: string) {
    return this.prisma.clienteCRM.delete({
      where: { id },
    });
  }
}
