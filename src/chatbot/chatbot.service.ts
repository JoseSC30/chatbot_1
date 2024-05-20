import OpenAI from 'openai'
import { Injectable } from '@nestjs/common';
import { promps } from './propms'
import { TwilioService } from 'nestjs-twilio';
import { PrismaService } from 'src/prisma/prisma.service';
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY
const openai = new OpenAI({ apiKey })
const { instrucciones, aceptacion } = promps()
let historial = []

@Injectable()
export class ChatbotService {
  constructor(
    private readonly twilioService: TwilioService,
    private readonly prisma: PrismaService) { }

  async chatbotFunction(any: any) {
    const mensajeRecibido = any.Body
    const numeroDeCelular = any.From
    const nombre = await this.getContactoByTelefono(numeroDeCelular)

    if (historial.length === 0) {
      historial.push({ role: 'user', content: instrucciones + nombre })
      historial.push({ role: 'system', content: aceptacion })
      historial.push({ role: 'user', content: mensajeRecibido })
    } else {
      historial.push({ role: 'user', content: mensajeRecibido })
    }

    try {
      const respuesta = await this.consultaChatGPT(historial)
      historial.push({ role: 'system', content: respuesta })
      this.enviarMensajePorWhatsapp(numeroDeCelular, respuesta)
      console.log([
        'hora:'+new Date(),
        'contacto: '+nombre,
        'numero: '+numeroDeCelular,
        'consulta: '+mensajeRecibido,
        'respuesta: '+respuesta]
      )
      return {
        'hora': new Date(),
        'contacto': nombre,
        'numero': numeroDeCelular,
        'consulta': mensajeRecibido,
        'respuesta': respuesta}
    } catch (error) {
      console.error('Error al obtener la respuesta:', error)
      return 'Error al obtener la respues.'
    }
  }
  
  async consultaChatGPT(mensaje: any[]) {
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: mensaje
    })
    return gptResponse.choices[0].message.content
  }
  
  async enviarMensajePorWhatsapp(celular: string, mensaje: string) {
    return this.twilioService.client.messages.create({
      body: mensaje,
      from: 'whatsapp:+14155238886',
      to: celular
    });
  }

  async getContactoByTelefono(telefono: string) {
    const res = await this.prisma.contacto.findFirst({
      where: {
        telefono: telefono
      }
    })
    return res.nombre
  }
  
  async getContactos() {
    const contactos = await this.prisma.contacto.findMany()
    return contactos
  }
  
  async imprimirHistorial() {
    return historial
  }
}
