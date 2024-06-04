import { Module } from '@nestjs/common';
import { ConsultasService } from './consultas.service';
import { ConsultasController } from './consultas.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ConsultasController],
  providers: [ConsultasService],
  exports: [ConsultasService],
  imports: [PrismaModule]
})
export class ConsultasModule {}
