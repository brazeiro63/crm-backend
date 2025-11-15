import { IsString, IsEnum, IsOptional, IsInt, IsObject } from 'class-validator';

export enum TipoContrato {
  ADMINISTRACAO_IMOVEL = 'ADMINISTRACAO_IMOVEL',
  LOCACAO_TEMPORADA = 'LOCACAO_TEMPORADA',
}

export enum StatusContrato {
  RASCUNHO = 'RASCUNHO',
  GERADO = 'GERADO',
  ASSINADO = 'ASSINADO',
  CANCELADO = 'CANCELADO',
}

export class CreateContratoDto {
  @IsEnum(TipoContrato)
  tipo: TipoContrato;

  @IsString()
  clienteId: string;

  @IsOptional()
  @IsString()
  staysReservaId?: string;

  @IsObject()
  dadosContrato: any;

  @IsString()
  pdfUrl: string;

  @IsOptional()
  @IsEnum(StatusContrato)
  status?: StatusContrato;

  @IsString()
  geradoPor: string;

  @IsOptional()
  @IsInt()
  versao?: number;
}
