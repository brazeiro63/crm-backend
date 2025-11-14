import { PartialType } from '@nestjs/mapped-types';
import { CreateInteracoeDto } from './create-interacoe.dto';

export class UpdateInteracoeDto extends PartialType(CreateInteracoeDto) {}
