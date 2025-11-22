import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsNumber,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BookingSource, PaymentStatus, ReservaStatus } from '@prisma/client';

export class CreateReservaDto {
  @IsOptional()
  @IsString()
  staysReservaId?: string;

  @IsUUID()
  imovelId: string;

  @IsUUID()
  clienteId: string;

  @IsOptional()
  @IsEnum(ReservaStatus)
  status?: ReservaStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsEnum(BookingSource)
  origem?: BookingSource;

  @IsOptional()
  @IsString()
  canal?: string;

  @Type(() => Date)
  @IsDate()
  checkIn: Date;

  @Type(() => Date)
  @IsDate()
  checkOut: Date;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalHospedes: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  valorTotal?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sinal?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  notasInternas?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pipelinePosicao?: number;
}
