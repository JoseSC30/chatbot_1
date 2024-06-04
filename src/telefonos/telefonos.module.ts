import { Module } from '@nestjs/common';
import { TelefonosService } from './telefonos.service';
import { TelefonosController } from './telefonos.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [TelefonosController],
  providers: [TelefonosService],
  exports: [TelefonosService],
  imports: [PrismaModule],
})
export class TelefonosModule {}
