import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsInt,
  Matches,
  Length,
  IsObject,
  Min,
  Max,
} from 'class-validator';

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

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(\+55\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, {
    message: 'Telefone deve estar em formato brasileiro válido',
  })
  telefone: string;

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
