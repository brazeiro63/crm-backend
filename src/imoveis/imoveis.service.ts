import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateImoveiDto } from './dto/create-imovei.dto';
import { UpdateImoveiDto } from './dto/update-imovei.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { InputJsonValue } from '@prisma/client/runtime/library';
import { StaysService } from '../stays/stays.service';

@Injectable()
export class ImoveisService {
  constructor(
    private prisma: PrismaService,
    private staysService: StaysService,
  ) {}

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

  async syncFromStays(limit = 100) {
    let skip = 0;
    let totalFetched = 0;
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const skippedReasons: Record<string, number> = {};

    while (true) {
      const response = await this.staysService.listImoveisPaginated(skip, limit);
      const imoveis = response?.data ?? [];

      if (!imoveis.length) {
        break;
      }

      for (const imovel of imoveis) {
        totalFetched += 1;

        if (!imovel._id) {
          skipped += 1;
          skippedReasons['id_invalido'] = (skippedReasons['id_invalido'] ?? 0) + 1;
          continue;
        }

        const enderecoParts = [
          imovel.address?.street,
          imovel.address?.number,
          imovel.address?.neighborhood,
          imovel.address?.city,
          imovel.address?.state,
          imovel.address?.country,
        ].filter(Boolean);

        const endereco = enderecoParts.join(', ');

        try {
          const existing = await this.prisma.imovelCRM.findUnique({
            where: { staysImovelId: imovel._id },
          });

          const historicoManutencao = (existing?.historicoManutencao as InputJsonValue[]) ?? [];
          const custosOperacionais = (existing?.custosOperacionais as InputJsonValue[]) ?? [];
          const documentacao = existing?.documentacao ?? [];

          await this.prisma.imovelCRM.upsert({
            where: { staysImovelId: imovel._id },
            update: {
              endereco: endereco || imovel.name,
              tipo: imovel.characteristics?.[0] ?? 'Imóvel',
              capacidade: imovel.capacity ?? existing?.capacidade ?? 0,
              historicoManutencao,
              custosOperacionais,
              documentacao,
              observacoes: imovel.description,
            },
            create: {
              staysImovelId: imovel._id,
              endereco: endereco || imovel.name,
              tipo: imovel.characteristics?.[0] ?? 'Imóvel',
              capacidade: imovel.capacity ?? 0,
              historicoManutencao: [],
              custosOperacionais: [],
              documentacao: [],
              observacoes: imovel.description,
            },
          });

          if (existing) {
            updated += 1;
          } else {
            created += 1;
          }
        } catch (error) {
          skipped += 1;
          skippedReasons['erro'] = (skippedReasons['erro'] ?? 0) + 1;
          console.error(`Erro ao sincronizar imóvel ${imovel._id}:`, error);
        }
      }

      skip += imoveis.length;
    }

    return {
      totalFetched,
      created,
      updated,
      skipped,
      skippedReasons,
    };
  }
}
