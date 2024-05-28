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
//----------------------
let historialPrueba = []
let timeoutId;
const confirmacion = 'Entiendo las instrucciones y las cumpliré a partir de ahora.'
let newConsulta;
//----------------------
//Si en 10 minutos no hay actividad, se reinicia el historial.
setTimeout(() => {
  historial = []
}, 600000);
//----------------------
@Injectable()
export class ChatbotService {
  constructor(
    private readonly twilioService: TwilioService,
    private readonly prisma: PrismaService) { }

  async chatbotFunction(any: any) {
    const mensajeRecibido = any.Body
    const numeroDeCelular = any.From
    const nombre = await this.getContactoByTelefono(numeroDeCelular)
    try {
      if (historial.length === 0) {
        historial.push({ role: 'user', content: instrucciones + nombre })
        historial.push({ role: 'system', content: aceptacion })
      }
      historial.push({ role: 'user', content: mensajeRecibido })
      const respuesta = await this.consultaChatGPT(historial)
      historial.push({ role: 'system', content: respuesta })
      this.enviarMensajePorWhatsapp(numeroDeCelular, respuesta)
      const res =
        ['hora:' + new Date(),
        'contacto: ' + nombre,
        'numero: ' + numeroDeCelular,
        'consulta: ' + mensajeRecibido,
        'respuesta: ' + respuesta]
      console.log(res)
      return res
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
    return historialPrueba
  }
  //-------------- PRUEBAS -------------------
  async agregarMensaje(mensaje: any) {
    historialPrueba.push(mensaje)
    this.reiniciarTemporizador()
    console.log("Mensaje agregado.")
  }

  async vaciarHistorial() {
    historialPrueba = []
    console.log("El historialPrueba está vacio. El siguiente mensaje creará una nueva consulta.")
  }

  async reiniciarTemporizador() {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(this.vaciarHistorial, 60000)//Despues de un minuto sin mensajes nuevos, se da por terminada la consulta.
  }

  async chatbotPrueba(any: any) {
    const mensajeRecibido = any.Body
    const numeroDeCelular = any.From
    //Extraer los ultimos 8 caracteres del numero de celular y guardarlo en la variable numero.
    if (historialPrueba.length === 0) {
      const numeroCel = numeroDeCelular.slice(-8)
      const telefono = await this.prisma.telefono.findFirst({
        where: {
          numero: numeroCel
        }
      })
      const id_cliente = telefono.clienteId
      const cliente = await this.prisma.cliente.findUnique({
        where: {
          id: id_cliente
        }
      })
      const infoCliente = `Nombre del cliente: ${cliente.nombre}
                      Información del cliente: ${cliente.infoAdicional}`;
      const prompt = await this.prisma.prompt.findUnique({
        where: {
          id: 3
        }
      })
      const indicaciones = prompt.prompt
      const consultas = await this.prisma.consulta.findMany({
        where: {
          clienteId: id_cliente
        }
      })
      const consulta = consultas[consultas.length - 1]
      const mensajes = await this.prisma.mensaje.findMany({
        where: {
          consultaId: consulta.id
        }
      })
      //El contenido y en valor del atributo chatbot de cada uno de los mensajes, se guarda en la variable antiguaConsulta.
      let antiguaConsulta = ""
      for (let i = 0; i < mensajes.length; i++) {
        if (mensajes[i].chatbot === false) {
          antiguaConsulta = antiguaConsulta + 'usuario: ' + mensajes[i].contenido + '\n'
        } else {
          antiguaConsulta = antiguaConsulta + 'sistema: ' + mensajes[i].contenido + '\n'
        }
      }

      historialPrueba.push({
        role: 'user',
        content:
          `Instrucciones:
          ${indicaciones}
          Información del cliente:
          ${infoCliente}
          Contenido de la anterior conversación:
          ${antiguaConsulta}`
      })
      historialPrueba.push({ role: 'system', content: confirmacion })
      newConsulta = await this.prisma.consulta.create({
        data: {
          clienteId: cliente.id,
          promptId: prompt.id
        }
      })
    }
    historialPrueba.push({ role: 'user', content: mensajeRecibido })
    //Registrar el mensaje en la base de datos.
    await this.prisma.mensaje.create({
      data: {
        consultaId: newConsulta.id,
        chatbot: false,
        contenido: mensajeRecibido
      }
    })
    const respuesta = await this.consultaChatGPT(historialPrueba)
    // historialPrueba.push({ role: 'system', content: respuesta })
    this.enviarMensajePorWhatsapp(numeroDeCelular, respuesta)
    this.agregarMensaje({ role: 'system', content: respuesta })
    await this.prisma.mensaje.create({
      data: {
        consultaId: newConsulta.id,
        chatbot: true,
        contenido: respuesta
      }
    })
    console.log(historialPrueba)
    return historialPrueba
  }
  //--------------------------------
}
