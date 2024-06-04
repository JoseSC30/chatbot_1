import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { TwilioModule } from 'nestjs-twilio';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConsultasModule } from 'src/consultas/consultas.module';
import { ClientesModule } from 'src/clientes/clientes.module';
import { MensajesModule } from 'src/mensajes/mensajes.module';
import { TelefonosModule } from 'src/telefonos/telefonos.module';
import { PromptModule } from 'src/prompt/prompt.module';

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService],
  imports: [TwilioModule.forRoot({
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN
  }),
    PrismaModule,
    ClientesModule,
    ConsultasModule,
    MensajesModule,
    TelefonosModule,
    PromptModule]
})
export class ChatbotModule { }
