import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatbotModule } from './chatbot/chatbot.module';
import { TwilioModule } from 'nestjs-twilio';
import { ClientesModule } from './clientes/clientes.module';
import { TelefonosModule } from './telefonos/telefonos.module';
import { PromptModule } from './prompt/prompt.module';
import { ConsultasModule } from './consultas/consultas.module';
import { MensajesModule } from './mensajes/mensajes.module';
import { ChromadbModule } from './chromadb/chromadb.module';
require('dotenv').config();

@Module({
  imports: [ChatbotModule, ClientesModule, TelefonosModule, PromptModule, ConsultasModule, MensajesModule, ChromadbModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
