import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInteracoeDto } from './dto/create-interacoe.dto';
import { UpdateInteracoeDto } from './dto/update-interacoe.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class InteracoesService {
  constructor(private prisma: PrismaService) {}

  async create(createInteracoeDto: CreateInteracoeDto) {
    return this.prisma.interacao.create({
      data: {
        ...createInteracoeDto,
        anexos: createInteracoeDto.anexos ?? [],
      },
    });
  }

  async findAll(skip = 0, take = 50, tipo?: string, categoria?: string, clienteId?: string) {
    const where: Prisma.InteracaoWhereInput = {};

    if (tipo) {
      where.tipo = tipo as any;
    }
    if (categoria) {
      where.categoria = categoria as any;
    }
    if (clienteId) {
      where.clienteId = clienteId;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.interacao.findMany({
        where,
        skip,
        take,
        include: {
          cliente: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
          contrato: {
            select: {
              id: true,
              tipo: true,
              status: true,
            },
          },
          registrador: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
        },
        orderBy: { dataHora: 'desc' },
      }),
      this.prisma.interacao.count({ where }),
    ]);

    return {
      data,
      meta: {
        skip,
        take,
        total,
        hasMore: skip + data.length < total,
      },
    };
  }

  async findOne(id: string) {
    const interacao = await this.prisma.interacao.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            email: true,
            telefone: true,
          },
        },
        contrato: {
          select: {
            id: true,
            tipo: true,
            status: true,
            geradoEm: true,
          },
        },
        registrador: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    if (!interacao) {
      throw new NotFoundException(`Interação com ID ${id} não encontrada`);
    }

    return interacao;
  }

  async update(id: string, updateInteracoeDto: UpdateInteracoeDto) {
    try {
      return await this.prisma.interacao.update({
        where: { id },
        data: updateInteracoeDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Interação com ID ${id} não encontrada`);
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.interacao.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Interação com ID ${id} não encontrada`);
        }
      }
      throw error;
    }
  }
}
