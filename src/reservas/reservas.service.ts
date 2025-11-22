import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  BookingSource,
  PaymentStatus,
  ReservaStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
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
      telefone: true,
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
      dataPrevista: 'asc',
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
  constructor(private prisma: PrismaService) {}

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
