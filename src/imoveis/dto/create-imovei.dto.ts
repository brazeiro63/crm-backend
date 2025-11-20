import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  IsDate,
  IsEnum,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ImovelStatus } from '@prisma/client';

export class CreateImoveiDto {
  @IsOptional()
  @IsString()
  staysImovelId?: string;

  @IsString()
  nome: string;

  @IsString()
  endereco: string;

  @IsString()
  tipo: string;

  @IsInt()
  capacidade: number;

  @IsOptional()
  @IsEnum(ImovelStatus)
  status?: ImovelStatus;

  @IsOptional()
  @IsString()
  responsavelLocal?: string;

  @IsOptional()
  @IsString()
  responsavelContato?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  comodidades?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fotos?: string[];

  @IsOptional()
  @IsObject()
  instrucoes?: Record<string, any>;

  @IsOptional()
  @IsArray()
  historicoManutencao?: any[];

  @IsOptional()
  @IsArray()
  custosOperacionais?: any[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentacao?: string[];

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  ultimaVistoria?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  proximaManutencao?: Date;
}
