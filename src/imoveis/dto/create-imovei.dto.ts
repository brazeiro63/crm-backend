import {
  IsString,
  IsInt,
  IsNumber,
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

  @IsOptional()
  @IsString()
  rua?: string;

  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  @IsString()
  complemento?: string;

  @IsOptional()
  @IsString()
  bairro?: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  cep?: string;

  @IsOptional()
  @IsString()
  apartamento?: string;

  @IsString()
  tipo: string;

  @IsInt()
  capacidade: number;

  @IsOptional()
  @IsString()
  matricula?: string;

  @IsOptional()
  @IsString()
  cartorio?: string;

  @IsOptional()
  @IsString()
  inscricaoMunicipal?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  valorMinimoDiaria?: number;

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
