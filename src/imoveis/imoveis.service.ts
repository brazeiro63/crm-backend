import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateImoveiDto } from './dto/create-imovei.dto';
import { UpdateImoveiDto } from './dto/update-imovei.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ImovelStatus } from '@prisma/client';
import { InputJsonValue } from '@prisma/client/runtime/library';
import {
  StaysImovelBooking,
  StaysProperty,
  StaysService,
} from '../stays/stays.service';

@Injectable()
export class ImoveisService {
  private readonly logger = new Logger(ImoveisService.name);

  constructor(
    private prisma: PrismaService,
    private staysService: StaysService,
  ) {}

  async create(createImoveiDto: CreateImoveiDto) {
    const {
      historicoManutencao,
      custosOperacionais,
      documentacao,
      comodidades,
      fotos,
      instrucoes,
      ...rest
    } = createImoveiDto;
    const instrucoesValue = instrucoes ? (instrucoes as InputJsonValue) : Prisma.JsonNull;

    return this.prisma.imovelCRM.create({
      data: {
        ...rest,
        status: createImoveiDto.status ?? ImovelStatus.DISPONIVEL,
        responsavelLocal: createImoveiDto.responsavelLocal,
        responsavelContato: createImoveiDto.responsavelContato,
        historicoManutencao: historicoManutencao ?? [],
        custosOperacionais: custosOperacionais ?? [],
        documentacao: documentacao ?? [],
        comodidades: comodidades ?? [],
        fotos: fotos ?? [],
        instrucoes: instrucoesValue,
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
          status: true,
          responsavelLocal: true,
          responsavelContato: true,
          comodidades: true,
          fotos: true,
          instrucoes: true,
          nome: true,
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
    const propertyCache = new Map<string, StaysProperty | null>();

    const pickFirstString = (...values: Array<string | null | undefined>) => {
      for (const value of values) {
        if (typeof value !== 'string') {
          continue;
        }
        const trimmed = value.trim();
        if (trimmed) {
          return trimmed;
        }
      }
      return undefined;
    };

    const pickFirstNumber = (...values: Array<number | null | undefined>) => {
      for (const value of values) {
        if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
          return value;
        }
      }
      return undefined;
    };

    const formatAddress = (
      address?:
        | {
            street?: string;
            number?: string;
            complement?: string;
            neighborhood?: string;
            city?: string;
            state?: string;
            country?: string;
            zipcode?: string;
          }
        | null,
    ) => {
      if (!address) {
        return undefined;
      }
      const parts = [
        address.street,
        address.number,
        address.complement,
        address.neighborhood,
        address.city,
        address.state,
        address.country,
        address.zipcode,
      ]
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter(Boolean);

      if (!parts.length) {
        return undefined;
      }

      return parts.join(', ');
    };

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

        try {
          const existing = await this.prisma.imovelCRM.findUnique({
            where: { staysImovelId: imovel._id },
          });

          const hasNome =
            Boolean(
              pickFirstString(
                imovel.name,
                imovel.internalName,
                imovel._mstitle?.pt_BR,
                imovel._mstitle?.en_US,
              ),
            );
          const hasEndereco = Boolean(formatAddress(imovel.address));
          const lacksCapacity =
            imovel.capacity == null &&
            imovel._i_maxGuests == null;

          let staysImovel = imovel;
          let bookingImovel: StaysImovelBooking | null = null;
          if (!hasNome || !hasEndereco || lacksCapacity) {
            try {
              const [detalhes, bookingDetalhes] = await Promise.all([
                this.staysService.getImovelDetalhes(imovel._id),
                this.staysService.getImovelBookingDetalhes(imovel._id),
              ]);
              if (detalhes) {
                staysImovel = {
                  ...detalhes,
                  ...staysImovel,
                  address: {
                    ...(detalhes.address ?? {}),
                    ...(staysImovel.address ?? {}),
                  },
                };
              }
              if (bookingDetalhes) {
                bookingImovel = bookingDetalhes;
              }
            } catch (detailError) {
              this.logger.warn(
                `Não foi possível buscar detalhes adicionais do imóvel ${imovel._id}: ${detailError}`,
              );
            }
          }

          const propertyId =
            staysImovel._idproperty ??
            bookingImovel?._idproperty;

          let property: StaysProperty | null = null;
          if (propertyId && (!hasEndereco || !hasNome)) {
            if (propertyCache.has(propertyId)) {
              property = propertyCache.get(propertyId) ?? null;
            } else {
              try {
                property = await this.staysService.getImovelPropertyDetalhes(propertyId);
              } catch (propertyError) {
                this.logger.warn(
                  `Não foi possível buscar propriedade ${propertyId}: ${propertyError}`,
                );
                property = null;
              }
              propertyCache.set(propertyId, property);
            }
          }

          const enderecoProperty = formatAddress(property?.address);
          const enderecoPrimario = enderecoProperty ?? formatAddress(staysImovel.address);
          const enderecoSecundario = formatAddress(bookingImovel?.address ?? null);
          const endereco = enderecoPrimario ?? enderecoSecundario;
          let resolvedNome =
            pickFirstString(
              staysImovel._mstitle?.pt_BR,
              staysImovel.name,
              staysImovel.internalName,
              staysImovel.title,
              staysImovel.displayName,
              staysImovel.unitName,
              bookingImovel?._mstitle?.pt_BR,
              bookingImovel?.name,
              bookingImovel?.internalName,
              bookingImovel?.title,
              bookingImovel?.displayName,
              bookingImovel?.unitName,
              property?._mstitle?.pt_BR,
              property?.name,
              property?.title,
              property?.displayName,
              staysImovel._mstitle?.en_US,
              bookingImovel?._mstitle?.en_US,
              property?._mstitle?.en_US,
              existing?.nome,
              endereco,
            ) ?? 'Imóvel';
          const resolvedEndereco =
            pickFirstString(
              endereco,
              existing?.endereco,
            ) ?? resolvedNome;

          if (
            resolvedNome &&
            resolvedEndereco &&
            resolvedNome.toLowerCase() === resolvedEndereco.toLowerCase()
          ) {
            const shortened = resolvedNome.split(',')[0]?.trim();
            if (shortened && shortened.length) {
              resolvedNome = shortened;
            }
          }

          const resolvedCapacidade =
            pickFirstNumber(
              staysImovel.capacity,
              staysImovel._i_maxGuests,
              bookingImovel?.capacity,
              bookingImovel?.maxGuests,
              bookingImovel?._i_maxGuests,
              existing?.capacidade,
            ) ?? 0;

          const historicoManutencao = (existing?.historicoManutencao as InputJsonValue[]) ?? [];
          const custosOperacionais = (existing?.custosOperacionais as InputJsonValue[]) ?? [];
          const documentacao = existing?.documentacao ?? [];

          await this.prisma.imovelCRM.upsert({
            where: { staysImovelId: imovel._id },
            update: {
              nome: resolvedNome,
              endereco: resolvedEndereco,
              tipo: imovel.characteristics?.[0] ?? 'Imóvel',
              capacidade: resolvedCapacidade,
              historicoManutencao,
              custosOperacionais,
              documentacao,
              observacoes: imovel.description,
            },
            create: {
              staysImovelId: imovel._id,
              nome: resolvedNome,
              endereco: resolvedEndereco,
              tipo: imovel.characteristics?.[0] ?? 'Imóvel',
              capacidade: resolvedCapacidade,
              status: existing?.status ?? ImovelStatus.DISPONIVEL,
              responsavelLocal: existing?.responsavelLocal ?? null,
              responsavelContato: existing?.responsavelContato ?? null,
              comodidades: existing?.comodidades ?? [],
              fotos: existing?.fotos ?? [],
              instrucoes: existing?.instrucoes ?? Prisma.JsonNull,
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
