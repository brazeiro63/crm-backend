import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  StaysService,
  StaysClientesFilters,
  StaysCliente as StaysClienteApi,
  StaysClienteDetalhado,
} from '../stays/stays.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ClientesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly staysService: StaysService,
  ) {}

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

    const [data, total] = await this.prisma.$transaction([
      this.prisma.clienteCRM.findMany({
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
      }),
      this.prisma.clienteCRM.count({ where }),
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

  /**
   * Lista clientes diretamente da API Stays - usado enquanto o CRM não sincroniza os dados
   */
  async findAllFromStays(
    filters?: StaysClientesFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<ClientesStaysResponse> {
    const clientes = await this.staysService.listClientes(filters);

    const total = clientes.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const skip = (safePage - 1) * limit;
    const paginatedClientes = clientes.slice(skip, skip + limit);

    return {
      data: paginatedClientes.map(mapStaysClienteToResponse),
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },
    };
  }

  /**
   * Busca cliente específico na Stays e normaliza formato para o frontend atual
   */
  async findOneFromStays(id: string): Promise<ClienteStays | null> {
    const cliente = await this.staysService.getClienteById(id);

    if (!cliente) {
      return null;
    }

    return mapStaysClienteToResponse(cliente);
  }

  /**
   * Sincroniza base de clientes entre Stays e CRM
   */
  async syncFromStays(limit = 100) {
    let skip = 0;
    let totalFetched = 0;
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const skippedReasons: Record<string, number> = {};

    while (true) {
      const response = await this.staysService.listClientesPaginated(skip, limit);
      const clientes = response?.data ?? [];

      if (!clientes.length) {
        break;
      }

      for (const cliente of clientes) {
        totalFetched += 1;
        try {
          const detail = await this.staysService.getClienteById(cliente._id);
          if (!detail) {
            skipped += 1;
            skippedReasons['detalhe_inexistente'] = (skippedReasons['detalhe_inexistente'] ?? 0) + 1;
            continue;
          }

          const cpfFromDocuments = detail.documents?.find((doc) =>
            doc.type?.toLowerCase().includes('cpf'),
          )?.numb;
          const cpf = cpfFromDocuments?.replace(/\D/g, '');

          if (!cpf || cpf.length < 11) {
            skipped += 1;
            skippedReasons['cpf_invalido'] = (skippedReasons['cpf_invalido'] ?? 0) + 1;
            continue;
          }

          if (!detail.email) {
            skipped += 1;
            skippedReasons['email_ausente'] = (skippedReasons['email_ausente'] ?? 0) + 1;
            continue;
          }

          const nome = `${detail.fName || ''} ${detail.lName || ''}`.trim() || detail.fName || detail.lName || 'Cliente Stays';
          const telefone = detail.phones?.[0]?.num ?? '';
          const totalReservas = detail.reservations?.length ?? 0;
          const valorTotalGasto = detail.reservations?.reduce(
            (sum, reserva) => sum + (reserva.price?._f_total ?? 0),
            0,
          ) ?? 0;
          const ultimaReserva = detail.reservations?.reduce<string | null>((latest, reserva) => {
            const data = reserva.checkInDate ?? reserva.checkOutDate;
            if (!data) {
              return latest;
            }
            const current = new Date(data).getTime();
            if (!latest) {
              return data;
            }
            return current > new Date(latest).getTime() ? data : latest;
          }, null);

          const existing = await this.prisma.clienteCRM.findUnique({
            where: { staysClientId: cliente._id },
          });

          await this.prisma.clienteCRM.upsert({
            where: { staysClientId: cliente._id },
            update: {
              nome,
              cpf,
              email: detail.email,
              telefone,
              origem: cliente.kind,
              totalReservas,
              valorTotalGasto: new Decimal(valorTotalGasto.toFixed(2)),
              ultimaReserva: ultimaReserva ? new Date(ultimaReserva) : null,
            },
            create: {
              staysClientId: cliente._id,
              nome,
              cpf,
              email: detail.email,
              telefone,
              tags: [],
              score: 0,
              origem: cliente.kind,
              totalReservas,
              valorTotalGasto: new Decimal(valorTotalGasto.toFixed(2)),
              ultimaReserva: ultimaReserva ? new Date(ultimaReserva) : null,
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
          console.error(`Erro ao sincronizar cliente ${cliente._id}:`, error);
        }
      }

      skip += clientes.length;
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

const mapStaysClienteToResponse = (cliente: StaysClienteLike): ClienteStays => ({
  id: cliente._id,
  nome: `${cliente.fName} ${cliente.lName}`.trim(),
  email: cliente.email,
  tipo: cliente.kind,
  isUsuario: cliente.isUser,
  dataCadastro: new Date().toISOString(),
});

type StaysClienteLike = Pick<
  StaysClienteApi | StaysClienteDetalhado,
  '_id' | 'fName' | 'lName' | 'email' | 'kind' | 'isUser'
>;

export interface ClienteStays {
  id: string;
  nome: string;
  email?: string;
  tipo: string;
  isUsuario: boolean;
  dataCadastro: string;
}

export interface ClientesStaysResponse {
  data: ClienteStays[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
