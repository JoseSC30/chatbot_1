import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { Request } from 'express';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('chatbot-function')
  chatbotFunction(@Body() any: any) {
    return this.chatbotService.chatbotFunction(any);
  }

  @Post('chatbot-prueba')
  chatbotPrueba(@Body() any: any) {
    return this.chatbotService.chatbotPrueba(any);
  }

  @Get('imprimir-historial')
  imprimirHistorial() {
    return this.chatbotService.imprimirHistorial();
  }

  @Post('prueba')
  prueba(@Body() req: Request) {
    console.log(req);
    return this.chatbotService.chatbotFunction(req);
  }

  @Get('contactos')
  getContactos() {
    return this.chatbotService.getContactos();
  }
}
