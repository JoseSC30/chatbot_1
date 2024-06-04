import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { Request } from 'express';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('chatbot')
  chatbot(@Body() any: any) {
    return this.chatbotService.chatbot(any);
  }

  @Get('imprimir-historial')
  imprimirHistorial() {
    return this.chatbotService.imprimirHistorial();
  }

  @Get('sintomas')
  getSintomas() {
    return this.chatbotService.getSintomas();
  }

}
