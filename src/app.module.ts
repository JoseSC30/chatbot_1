import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatbotModule } from './chatbot/chatbot.module';
import { TwilioModule } from 'nestjs-twilio';
require('dotenv').config();

@Module({
  imports: [ChatbotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
