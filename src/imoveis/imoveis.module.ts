import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ImoveisService } from './imoveis.service';
import { ImoveisController } from './imoveis.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ImoveisController],
  providers: [ImoveisService],
})
export class ImoveisModule {}
