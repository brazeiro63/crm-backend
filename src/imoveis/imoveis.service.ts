import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateImoveiDto } from './dto/create-imovei.dto';
import { UpdateImoveiDto } from './dto/update-imovei.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ImoveisService {
  constructor(private prisma: PrismaService) {}

  async create(createImoveiDto: CreateImoveiDto) {
    return this.prisma.imovelCRM.create({
      data: {
        ...createImoveiDto,
        historicoManutencao: createImoveiDto.historicoManutencao ?? [],
        custosOperacionais: createImoveiDto.custosOperacionais ?? [],
        documentacao: createImoveiDto.documentacao ?? [],
      },
    });
  }

  async findAll(skip = 0, take = 50, tipo?: string) {
    const where: Prisma.ImovelCRMWhereInput = {};

    if (tipo) {
      where.tipo = tipo;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.imovelCRM.findMany({
        where,
        skip,
        take,
        orderBy: { dataCadastro: 'desc' },
        select: {
          id: true,
          staysImovelId: true,
          endereco: true,
          tipo: true,
          capacidade: true,
          ultimaVistoria: true,
          proximaManutencao: true,
          dataCadastro: true,
        },
      }),
      this.prisma.imovelCRM.count({ where }),
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
    const imovel = await this.prisma.imovelCRM.findUnique({
      where: { id },
    });

    if (!imovel) {
      throw new NotFoundException(`Imóvel com ID ${id} não encontrado`);
    }

    return imovel;
  }

  async update(id: string, updateImoveiDto: UpdateImoveiDto) {
    try {
      return await this.prisma.imovelCRM.update({
        where: { id },
        data: updateImoveiDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Imóvel com ID ${id} não encontrado`);
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.imovelCRM.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Imóvel com ID ${id} não encontrado`);
        }
      }
      throw error;
    }
  }
}
