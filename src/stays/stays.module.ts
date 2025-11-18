import { Module } from '@nestjs/common';
import { StaysService } from './stays.service';

@Module({
  providers: [StaysService],
  exports: [StaysService],
})
export class StaysModule {}
