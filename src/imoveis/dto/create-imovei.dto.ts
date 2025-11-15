import { IsString, IsInt, IsOptional, IsArray, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateImoveiDto {
  @IsOptional()
  @IsString()
  staysImovelId?: string;

  @IsString()
  endereco: string;

  @IsString()
  tipo: string;

  @IsInt()
  capacidade: number;

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
