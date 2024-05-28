import { Module } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { PromptController } from './prompt.controller';
import { PrismaModule } from 'src/prisma/prisma.module';


@Module({
  controllers: [PromptController],
  providers: [PromptService],
  imports: [PrismaModule]
})
export class PromptModule {}
