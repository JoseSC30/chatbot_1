import OpenAI from 'openai'
import { Injectable } from '@nestjs/common';
import { promps } from './propms'
import { TwilioService } from 'nestjs-twilio';
import { PrismaService } from 'src/prisma/prisma.service';

require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY
const openai = new OpenAI( {apiKey})

let messageHistory = []
const { instrucciones, aceptacion } = promps()

let respuestaACelular = ""

@Injectable()
export class ChatbotService {
  constructor(private readonly twilioService: TwilioService, private prisma: PrismaService) {}

  async chatbotFunction(any: any) {

    const mensajeRecibido = any.Body
    const numeroDeCelular = any.From
    let nombreDePersona = "Alguien"

    const contactos = await this.getContactos()
    console.log(contactos[0].nombre)
    //Si el telefono no esta en la base de datos, guardar el nombre de la persona.
    for (let i = 0; i < contactos.length; i++) {
      if (contactos[i].telefono === numeroDeCelular) {
        nombreDePersona = contactos[i].nombre
        console.log(nombreDePersona)
        break
      }
    }

    if (messageHistory.length === 0) {
      messageHistory.push({ role: 'user', content: instrucciones+nombreDePersona })
      messageHistory.push({ role: 'system', content: aceptacion})
    } else {
      // messageHistory.push({ role: 'user', content: any.message })
      messageHistory.push({ role: 'user', content: mensajeRecibido })
    }
    try {
      const gptResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messageHistory
      })

      respuestaACelular = gptResponse.choices[0].message.content
      let res = [respuestaACelular, numeroDeCelular]
      this.respuestaWhatsapp(res)

      messageHistory.push({ role: 'system', content: gptResponse.choices[0].message.content})
      return gptResponse.choices[0].message.content
    } catch (error) {
      console.error('Error al obtener la respuesta:', error)
      return 'Error al obtener la respues.'
    }
  }

  async imprimirHistorial() {
    return messageHistory
  }

  async respuestaWhatsapp(req: any) {
    console.log(req[0].toString())
    return this.twilioService.client.messages.create({
      body: req[0].toString(),
      from: 'whatsapp:+14155238886',
      to: req[1].toString()
    });
  }

  async getContactos() {
    return this.prisma.contacto.findMany()
  }

}
