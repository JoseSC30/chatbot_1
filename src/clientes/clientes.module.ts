import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService],
  imports: [PrismaModule]
})
export class ClientesModule {}
