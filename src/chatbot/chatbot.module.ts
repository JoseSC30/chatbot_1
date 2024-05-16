import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { TwilioModule } from 'nestjs-twilio';

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService],
  imports: [TwilioModule.forRoot({
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN
  })]
})
export class ChatbotModule {}
