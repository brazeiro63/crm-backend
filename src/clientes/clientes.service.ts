import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto) {
    try {
      return await this.prisma.clienteCRM.create({
        data: {
          ...createClienteDto,
          tags: createClienteDto.tags ?? [],
          score: createClienteDto.score ?? 0,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Cliente com este CPF ou email já existe');
        }
      }
      throw error;
    }
  }

  async findAll(skip = 0, take = 50, tag?: string, origem?: string) {
    const where: Prisma.ClienteCRMWhereInput = {};

    if (tag) {
      where.tags = { has: tag };
    }
    if (origem) {
      where.origem = origem;
    }

    return this.prisma.clienteCRM.findMany({
      where,
      skip,
      take,
      orderBy: { dataCadastro: 'desc' },
      select: {
        id: true,
        nome: true,
        cpf: true,
        email: true,
        telefone: true,
        tags: true,
        score: true,
        origem: true,
        dataCadastro: true,
        ultimaReserva: true,
        totalReservas: true,
        valorTotalGasto: true,
      },
    });
  }

  async findOne(id: string) {
    const cliente = await this.prisma.clienteCRM.findUnique({
      where: { id },
      include: {
        contratos: {
          select: {
            id: true,
            tipo: true,
            status: true,
            geradoEm: true,
          },
          orderBy: { geradoEm: 'desc' },
        },
        interacoes: {
          select: {
            id: true,
            tipo: true,
            categoria: true,
            descricao: true,
            dataHora: true,
          },
          orderBy: { dataHora: 'desc' },
          take: 10,
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
    }

    return cliente;
  }

  async update(id: string, updateClienteDto: UpdateClienteDto) {
    try {
      return await this.prisma.clienteCRM.update({
        where: { id },
        data: updateClienteDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
        }
        if (error.code === 'P2002') {
          throw new ConflictException('CPF ou email já existe para outro cliente');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.clienteCRM.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Cliente com ID ${id} não encontrado`);
        }
      }
      throw error;
    }
  }
}
