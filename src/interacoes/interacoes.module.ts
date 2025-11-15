import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { InteracoesService } from './interacoes.service';
import { InteracoesController } from './interacoes.controller';

@Module({
  imports: [PrismaModule],
  controllers: [InteracoesController],
  providers: [InteracoesService],
})
export class InteracoesModule {}
