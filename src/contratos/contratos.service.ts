import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContratosService {
  constructor(private prisma: PrismaService) {}

  async create(createContratoDto: CreateContratoDto) {
    return this.prisma.contratoGerado.create({
      data: {
        ...createContratoDto,
        versao: createContratoDto.versao ?? 1,
      },
    });
  }

  async findAll(skip = 0, take = 50, tipo?: string, status?: string) {
    const where: Prisma.ContratoGeradoWhereInput = {};

    if (tipo) {
      where.tipo = tipo;
    }
    if (status) {
      where.status = status;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.contratoGerado.findMany({
        where,
        skip,
        take,
        include: {
          cliente: {
            select: {
              id: true,
              nome: true,
              cpf: true,
              email: true,
            },
          },
          gerador: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
        },
        orderBy: { geradoEm: 'desc' },
      }),
      this.prisma.contratoGerado.count({ where }),
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
    const contrato = await this.prisma.contratoGerado.findUnique({
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
        gerador: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
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
        },
      },
    });

    if (!contrato) {
      throw new NotFoundException(`Contrato com ID ${id} não encontrado`);
    }

    return contrato;
  }

  async update(id: string, updateContratoDto: UpdateContratoDto) {
    try {
      return await this.prisma.contratoGerado.update({
        where: { id },
        data: updateContratoDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Contrato com ID ${id} não encontrado`);
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.contratoGerado.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Contrato com ID ${id} não encontrado`);
        }
      }
      throw error;
    }
  }
}
