import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';

export enum TipoInteracao {
  EMAIL = 'EMAIL',
  TELEFONE = 'TELEFONE',
  WHATSAPP = 'WHATSAPP',
  PRESENCIAL = 'PRESENCIAL',
  NOTA = 'NOTA',
}

export enum CategoriaInteracao {
  DUVIDA = 'DUVIDA',
  RECLAMACAO = 'RECLAMACAO',
  ELOGIO = 'ELOGIO',
  SUPORTE = 'SUPORTE',
  COMERCIAL = 'COMERCIAL',
}

export class CreateInteracoeDto {
  @IsString()
  clienteId: string;

  @IsOptional()
  @IsString()
  contratoId?: string;

  @IsEnum(TipoInteracao)
  tipo: TipoInteracao;

  @IsString()
  descricao: string;

  @IsEnum(CategoriaInteracao)
  categoria: CategoriaInteracao;

  @IsString()
  registradoPor: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  anexos?: string[];
}
