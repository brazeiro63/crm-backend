import { Module } from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { ReservasController } from './reservas.controller';
import { StaysModule } from '../stays/stays.module';

@Module({
  imports: [StaysModule],
  controllers: [ReservasController],
  providers: [ReservasService],
})
export class ReservasModule {}
