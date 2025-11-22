import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  Matches,
  Length,
  IsObject,
  Min,
  Max,
  IsEmail,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClienteDto {
  @IsOptional()
  @IsString()
  staysClientId?: string;

  @IsString()
  @Length(3, 100)
  nome: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, {
    message: 'CPF deve estar no formato XXX.XXX.XXX-XX ou apenas 11 dígitos',
  })
  cpf?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  emails?: string[];

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  telefones?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentoDto)
  documentos?: DocumentoDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsObject()
  preferencias?: any;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  observacoes?: string;

  @IsOptional()
  @IsString()
  origem?: string;
}

export class DocumentoDto {
  @IsString()
  @IsIn(['CPF', 'DNI', 'PASSAPORTE', 'OUTRO'])
  tipo: string;

  @IsString()
  numero: string;
}
