import { IsString, IsEmail, IsOptional, IsArray, IsInt } from 'class-validator';

export class CreateClienteDto {
  @IsOptional()
  @IsString()
  staysClientId?: string;

  @IsString()
  nome: string;

  @IsString()
  cpf: string;

  @IsEmail()
  email: string;

  @IsString()
  telefone: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsInt()
  score?: number;

  @IsOptional()
  preferencias?: any;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  origem?: string;
}
