import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StaysModule } from '../stays/stays.module';

@Module({
  imports: [PrismaModule, StaysModule],
  controllers: [ClientesController],
  providers: [ClientesService],
})
export class ClientesModule {}
