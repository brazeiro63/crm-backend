import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import {
  Prisma,
  BookingSource,
  PaymentStatus,
  ReservaStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StaysReservation, StaysService } from '../stays/stays.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';

const RESERVA_SELECT = {
  id: true,
  staysReservaId: true,
  status: true,
  paymentStatus: true,
  origem: true,
  canal: true,
  checkIn: true,
  checkOut: true,
  totalHospedes: true,
  valorTotal: true,
  sinal: true,
  observacoes: true,
  notasInternas: true,
  pipelinePosicao: true,
  createdAt: true,
  updatedAt: true,
  imovel: {
    select: {
      id: true,
      nome: true,
      tipo: true,
      endereco: true,
      responsavelLocal: true,
      responsavelContato: true,
    },
  },
  cliente: {
    select: {
      id: true,
      nome: true,
      email: true,
      emails: true,
      telefone: true,
      telefones: true,
      documentos: true,
      origem: true,
      tags: true,
    },
  },
};

const RESERVA_DETAIL_SELECT = {
  ...RESERVA_SELECT,
  tarefas: {
    select: {
      id: true,
      tipo: true,
      status: true,
      dataPrevista: true,
      dataConclusao: true,
      responsavel: true,
    },
    orderBy: {
      dataPrevista: Prisma.SortOrder.asc,
    },
  },
};

interface FindReservasParams {
  skip: number;
  take: number;
  status?: ReservaStatus;
  paymentStatus?: PaymentStatus;
  origem?: BookingSource;
  imovelId?: string;
  clienteId?: string;
  checkInFrom?: Date;
  checkInTo?: Date;
}

@Injectable()
export class ReservasService {
  private readonly logger = new Logger(ReservasService.name);

  constructor(
    private prisma: PrismaService,
    private staysService: StaysService,
  ) {}

  async create(createReservaDto: CreateReservaDto) {
    const data = this.buildCreateData(createReservaDto);

    return this.prisma.reserva.create({
      data,
      select: RESERVA_SELECT,
    });
  }

  async findAll(filters: FindReservasParams) {
    const where: Prisma.ReservaWhereInput = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }

    if (filters.origem) {
      where.origem = filters.origem;
    }

    if (filters.imovelId) {
      where.imovelId = filters.imovelId;
    }

    if (filters.clienteId) {
      where.clienteId = filters.clienteId;
    }

    if (filters.checkInFrom || filters.checkInTo) {
      where.checkIn = {};
      if (filters.checkInFrom) {
        where.checkIn.gte = filters.checkInFrom;
      }
      if (filters.checkInTo) {
        where.checkIn.lte = filters.checkInTo;
      }
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.reserva.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: [{ pipelinePosicao: 'asc' }, { checkIn: 'asc' }],
        select: RESERVA_SELECT,
      }),
      this.prisma.reserva.count({ where }),
    ]);

    return {
      data,
      meta: {
        skip: filters.skip,
        take: filters.take,
        total,
        hasMore: filters.skip + data.length < total,
      },
    };
  }

  async findOne(id: string) {
    const reserva = await this.prisma.reserva.findUnique({
      where: { id },
      select: RESERVA_DETAIL_SELECT,
    });

    if (!reserva) {
      throw new NotFoundException(`Reserva com ID ${id} não encontrada`);
    }

    return reserva;
  }

  async update(id: string, updateReservaDto: UpdateReservaDto) {
    const data = this.buildUpdateData(updateReservaDto);

    try {
      return await this.prisma.reserva.update({
        where: { id },
        data,
        select: RESERVA_SELECT,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Reserva com ID ${id} não encontrada`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.reserva.delete({
        where: { id },
        select: { id: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Reserva com ID ${id} não encontrada`);
      }
      throw error;
    }
  }

  private buildCreateData(
    dto: CreateReservaDto,
  ): Prisma.ReservaUncheckedCreateInput {
    const data: Prisma.ReservaUncheckedCreateInput = {
      imovelId: dto.imovelId,
      clienteId: dto.clienteId,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      totalHospedes: dto.totalHospedes,
    };

    if (dto.staysReservaId) data.staysReservaId = dto.staysReservaId;
    if (dto.status) data.status = dto.status;
    if (dto.paymentStatus) data.paymentStatus = dto.paymentStatus;
    if (dto.origem) data.origem = dto.origem;
    if (dto.canal) data.canal = dto.canal;
    if (dto.observacoes) data.observacoes = dto.observacoes;
    if (dto.notasInternas) data.notasInternas = dto.notasInternas;
    if (dto.pipelinePosicao !== undefined)
      data.pipelinePosicao = dto.pipelinePosicao;
    if (dto.valorTotal !== undefined)
      data.valorTotal = this.toDecimal(dto.valorTotal);
    if (dto.sinal !== undefined) data.sinal = this.toDecimal(dto.sinal);

    return data;
  }

  async syncFromStays(params?: {
    from?: string;
    to?: string;
    dateType?: 'arrival' | 'departure' | 'creation';
    limit?: number;
  }) {
    const from = params?.from ?? '2000-01-01';
    const to = params?.to ?? this.buildFutureDate(730);
    const dateType = params?.dateType ?? 'arrival';
    const limit = Math.max(1, Math.min(params?.limit ?? 100, 500));

    this.logger.log(
      `Sincronizando reservas da Stays (${dateType}) de ${from} até ${to} com lote ${limit}`,
    );

    let skip = 0;
    let totalFetched = 0;
    let created = 0;
    let updated = 0;
    let skipped = 0;
    const skippedReasons: Record<string, number> = {};
    const skippedClientes: string[] = [];

    const imovelCache = new Map<string, string | null>();
    const clienteCache = new Map<string, string | null>();

    while (true) {
      const reservas = await this.staysService.listReservas({
        from,
        to,
        dateType,
        skip,
        limit,
      });

      if (!reservas.length) {
        break;
      }

      for (const reserva of reservas) {
        totalFetched += 1;
        const staysReservaId = reserva._id ?? reserva.id;
        if (!staysReservaId) {
          skipped += 1;
          skippedReasons['id_invalido'] =
            (skippedReasons['id_invalido'] ?? 0) + 1;
          continue;
        }

        const checkIn = this.parseDate(reserva.checkInDate);
        const checkOut = this.parseDate(reserva.checkOutDate);

        if (!checkIn || !checkOut) {
          skipped += 1;
          skippedReasons['datas_invalidas'] =
            (skippedReasons['datas_invalidas'] ?? 0) + 1;
          continue;
        }

        const imovelId = await this.resolveImovelId(
          reserva._idlisting,
          imovelCache,
        );
        if (!imovelId) {
          skipped += 1;
          skippedReasons['imovel_nao_encontrado'] =
            (skippedReasons['imovel_nao_encontrado'] ?? 0) + 1;
          continue;
        }

        const clienteId = await this.resolveClienteId(
          reserva._idclient,
          clienteCache,
        );
        if (!clienteId) {
          skipped += 1;
          skippedReasons['cliente_nao_encontrado'] =
            (skippedReasons['cliente_nao_encontrado'] ?? 0) + 1;
          if (reserva._idclient) {
            skippedClientes.push(reserva._idclient);
          }
          continue;
        }

        const totalHospedes = this.resolveHospedes(reserva);
        const origem = this.resolveBookingSource(reserva);
        const canal = this.resolveCanal(reserva);
        const { valorTotal, totalPago } = this.resolveValores(reserva);
        const paymentStatus = this.resolvePaymentStatus(valorTotal, totalPago);
        const status = this.resolveReservaStatus(checkIn, checkOut);

        const data: Prisma.ReservaUncheckedCreateInput = {
          staysReservaId,
          imovelId,
          clienteId,
          checkIn,
          checkOut,
          totalHospedes,
          origem,
          canal,
          status,
          paymentStatus,
        };

        if (valorTotal !== undefined) {
          data.valorTotal = this.toDecimal(valorTotal);
        }
        if (totalPago !== undefined) {
          data.sinal = this.toDecimal(totalPago);
        }

        const existing = await this.prisma.reserva.findUnique({
          where: { staysReservaId },
          select: { id: true },
        });

        await this.prisma.reserva.upsert({
          where: { staysReservaId },
          update: data,
          create: data,
        });

        if (existing) {
          updated += 1;
        } else {
          created += 1;
        }
      }

      skip += reservas.length;
    }

    return {
      totalFetched,
      created,
      updated,
      skipped,
      skippedReasons,
      skippedClientes: Array.from(new Set(skippedClientes)),
      params: { from, to, dateType, limit },
    };
  }

  private buildFutureDate(daysAhead: number) {
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    return date.toISOString().slice(0, 10);
  }

  private parseDate(value?: string | null): Date | null {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date;
  }

  private async resolveImovelId(
    staysImovelId?: string,
    cache?: Map<string, string | null>,
  ): Promise<string | null> {
    if (!staysImovelId) {
      return null;
    }

    if (cache?.has(staysImovelId)) {
      return cache.get(staysImovelId) ?? null;
    }

    const imovel = await this.prisma.imovelCRM.findUnique({
      where: { staysImovelId },
      select: { id: true },
    });

    const id = imovel?.id ?? null;
    cache?.set(staysImovelId, id);
    return id;
  }

  private async resolveClienteId(
    staysClientId?: string,
    cache?: Map<string, string | null>,
  ): Promise<string | null> {
    if (!staysClientId) {
      return null;
    }

    if (cache?.has(staysClientId)) {
      return cache.get(staysClientId) ?? null;
    }

    const cliente = await this.prisma.clienteCRM.findUnique({
      where: { staysClientId },
      select: { id: true },
    });

    const id = cliente?.id ?? null;
    cache?.set(staysClientId, id);
    return id;
  }

  private resolveBookingSource(reserva: StaysReservation): BookingSource {
    const raw =
      reserva.partner?.name ??
      reserva.type ??
      reserva.agent?.name ??
      reserva.reservationUrl ??
      '';
    const normalized = raw.toLowerCase();

    if (normalized.includes('airbnb')) return BookingSource.AIRBNB;
    if (normalized.includes('booking')) return BookingSource.BOOKING;
    if (normalized.includes('expedia')) return BookingSource.EXPEDIA;
    if (normalized.includes('site') || normalized.includes('direto')) {
      return BookingSource.DIRETO;
    }

    return BookingSource.OUTRO;
  }

  private resolveCanal(reserva: StaysReservation) {
    return (
      reserva.partner?.name ??
      reserva.agent?.name ??
      reserva.type ??
      reserva.reservationUrl ??
      undefined
    );
  }

  private resolveHospedes(reserva: StaysReservation) {
    if (reserva.guests && reserva.guests > 0) {
      return reserva.guests;
    }
    const details = reserva.guestsDetails;
    const total =
      (details?.adults ?? 0) +
      (details?.children ?? 0) +
      (details?.infants ?? 0);
    return total > 0 ? total : 1;
  }

  private resolveValores(reserva: StaysReservation) {
    const valorTotal =
      reserva.price?._f_total ??
      reserva.price?.hostingDetails?._f_total ??
      reserva.price?.extrasDetails?._f_total;
    const totalPago = reserva.stats?._f_totalPaid;

    return {
      valorTotal:
        typeof valorTotal === 'number' && Number.isFinite(valorTotal)
          ? valorTotal
          : undefined,
      totalPago:
        typeof totalPago === 'number' && Number.isFinite(totalPago)
          ? totalPago
          : undefined,
    };
  }

  private resolvePaymentStatus(
    valorTotal?: number,
    totalPago?: number,
  ): PaymentStatus {
    if (valorTotal === undefined || valorTotal <= 0) {
      return PaymentStatus.PENDENTE;
    }

    if (totalPago === undefined || totalPago <= 0) {
      return PaymentStatus.PENDENTE;
    }

    if (totalPago >= valorTotal) {
      return PaymentStatus.PAGO;
    }

    if (totalPago > 0 && totalPago < valorTotal) {
      return PaymentStatus.PARCIAL;
    }

    return PaymentStatus.PENDENTE;
  }

  private resolveReservaStatus(checkIn: Date, checkOut: Date): ReservaStatus {
    const now = new Date();

    if (now >= checkOut) {
      return ReservaStatus.CONCLUIDO;
    }

    if (now >= checkIn) {
      return ReservaStatus.ATIVO;
    }

    return ReservaStatus.CHECKIN_AGENDADO;
  }

  private buildUpdateData(
    dto: UpdateReservaDto,
  ): Prisma.ReservaUncheckedUpdateInput {
    const data: Prisma.ReservaUncheckedUpdateInput = {};

    if (dto.staysReservaId !== undefined)
      data.staysReservaId = dto.staysReservaId;
    if (dto.imovelId !== undefined) data.imovelId = dto.imovelId;
    if (dto.clienteId !== undefined) data.clienteId = dto.clienteId;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.paymentStatus !== undefined) data.paymentStatus = dto.paymentStatus;
    if (dto.origem !== undefined) data.origem = dto.origem;
    if (dto.canal !== undefined) data.canal = dto.canal;
    if (dto.checkIn !== undefined) data.checkIn = dto.checkIn;
    if (dto.checkOut !== undefined) data.checkOut = dto.checkOut;
    if (dto.totalHospedes !== undefined) data.totalHospedes = dto.totalHospedes;
    if (dto.observacoes !== undefined) data.observacoes = dto.observacoes;
    if (dto.notasInternas !== undefined) data.notasInternas = dto.notasInternas;
    if (dto.pipelinePosicao !== undefined)
      data.pipelinePosicao = dto.pipelinePosicao;
    if (dto.valorTotal !== undefined)
      data.valorTotal = this.toDecimal(dto.valorTotal);
    if (dto.sinal !== undefined) data.sinal = this.toDecimal(dto.sinal);

    return data;
  }

  private toDecimal(value?: number) {
    if (value === undefined) {
      return undefined;
    }
    return new Prisma.Decimal(value);
  }
}
