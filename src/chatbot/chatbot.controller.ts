import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
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

  @Post('qwe')
  getMatriz(@Body() any: any) {
    return this.chatbotService.getMatriz(any);
  }

//   @Get('descargar-pdf')
// async descargarPDF(@Res() res: Response) {
//   const pdfFilePath = this.chatbotService.generarPDF(); // Genera el PDF

//   res.setHeader('Content-Type', 'application/pdf');
//   res.setHeader('Content-Disposition', 'attachment; filename=example.pdf'); // Nombre del archivo

//   fs.createReadStream(pdfFilePath).pipe(res);
// }

}
