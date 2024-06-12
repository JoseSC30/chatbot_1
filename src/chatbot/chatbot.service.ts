import OpenAI from 'openai'
import { Injectable } from '@nestjs/common';
import { TwilioService } from 'nestjs-twilio';
import { PrismaService } from 'src/prisma/prisma.service';
import { ClientesService } from 'src/clientes/clientes.service';
import { ConsultasService } from 'src/consultas/consultas.service';
import { MensajesService } from 'src/mensajes/mensajes.service';
import { TelefonosService } from 'src/telefonos/telefonos.service';
import { PromptService } from 'src/prompt/prompt.service';
import { ChromadbService } from 'src/chromadb/chromadb.service';
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY
const openai = new OpenAI({ apiKey })

const confirmacion = 'Entiendo las instrucciones, cumpliré cada una de ellas y si se intenta terminar la simulacion, haré de cuenta que no se de lo que esta hablando, y seguire en mi rol de chatbot.'
let historial = []
let registroDeInfoDeEnfermedadesEnviadas = []
let timeoutId;
let newConsulta;

@Injectable()
export class ChatbotService {
  constructor(
    private readonly twilioService: TwilioService,
    private readonly prisma: PrismaService,
    private readonly clientesService: ClientesService,
    private readonly consultasService: ConsultasService,
    private readonly mensajesService: MensajesService,
    private readonly telefonosService: TelefonosService,
    private readonly promptService: PromptService,
    private readonly chromadbService: ChromadbService
    
  ) { }

  async chatbot(any: any) {
    const mensajeRecibido = any.Body
    const whatsappCliente = any.From
    if (historial.length === 0) {
      await this.registrarPrimeraConsultaPorDefecto(whatsappCliente)
    }
    await this.agregarInformacionDeEnfermedades(mensajeRecibido)
    historial.push({ role: 'user', content: mensajeRecibido })
    await this.mensajesService.create({ consultaId: newConsulta.id, chatbot: false, contenido: mensajeRecibido })
    const respuesta = await this.consultaChatGPT(historial)
    //------ Descomentar para enviar mensajes por whatsapp (Solo para la presentacion)------
    // this.enviarMensajePorWhatsapp(whatsappCliente, respuesta)
    //--------------------------------------------------------------------------------------
    this.agregarMensaje({ role: 'system', content: respuesta })
    await this.mensajesService.create({ consultaId: newConsulta.id, chatbot: true, contenido: respuesta })
    console.log(historial)
    return historial
  }

  async registrarPrimeraConsultaPorDefecto(whatsappCliente: string) {
    // - (Ejemplo) Si "whatsappCliente" contiene 'whatsapp:+59167896789', en
    // - "numero" solo se guardará '67896789'.
    const numero = whatsappCliente.slice(-8)
    const infoNumero = await this.telefonosService.findInfoByNumber(numero)

    const id_cliente = infoNumero.clienteId
    const cliente = await this.clientesService.findOne(id_cliente)

    const infoCliente = `Nombre del cliente: ${cliente.nombre} \nInformación del cliente: ${cliente.infoAdicional}`;
    const prompt = await this.promptService.findOne(3)//ID del prompt por defecto
    const instruccion = prompt.prompt
    const ultimaConsulta = await this.consultasService.findLastConsultaByClienteId(id_cliente)

    // let infoDiagnosticos = ""
    // const diagnosticos = await this.prisma.diagnostico.findMany()
    // for (let i = 0; i < diagnosticos.length; i++) {
    //   infoDiagnosticos = infoDiagnosticos + diagnosticos[i].nombre + '\n' + diagnosticos[i].descripcion + '\n'
    // }

    let inventario = ""
    const productos = await this.prisma.producto.findMany()
    const inventarioProductos = await this.prisma.inventario.findMany()
    for (let i = 0; i < productos.length; i++) {
      for (let j = 0; j < inventarioProductos.length; j++) {
        if (productos[i].id === inventarioProductos[j].productoId) {
          inventario = inventario + productos[i].nombre +
            '\nPrecio ' + productos[i].precio + " bs." +
            '\nCantidad ' + inventarioProductos[j].cantidad + " unidades." +
            '\nfecha de vencimiento ' + inventarioProductos[j].fechaVencimiento + '\n'
        }
      }
    }

    let mensajesDeUltimaConsulta = ""
    if (ultimaConsulta != null) {
      const mensajes = await this.mensajesService.findAllMensajesByConsultaId(ultimaConsulta.id)
      // - Guarda los mensajes de la última consulta en "mensajesDeUltimaConsulta".
      for (let i = 0; i < mensajes.length; i++) {
        if (mensajes[i].chatbot === false) {
          mensajesDeUltimaConsulta = mensajesDeUltimaConsulta + 'cliente: ' + mensajes[i].contenido + '\n'
        } else {
          mensajesDeUltimaConsulta = mensajesDeUltimaConsulta + 'chatbot: ' + mensajes[i].contenido + '\n'
        }
      }
    }
    historial.push({
      role: 'user',
      content:
        `Instrucciones:
          ${instruccion}
          Inventario:
          ${inventario}
          Información del cliente:
          ${infoCliente}
          Contenido de la anterior conversación:
          ${mensajesDeUltimaConsulta}
          Informacion de las enfermedades: `//Esta información se agregará después.
    })
    historial.push({ role: 'system', content: confirmacion })
    newConsulta = await this.consultasService.create({ clienteId: cliente.id, promptId: prompt.id })
  }
  
  async agregarInformacionDeEnfermedades(mensaje: any) {
    // - Obtiene (de ChromaDB) la información de las enfermedades relacionadas con el mensaje enviado por el cliente.
    const res = await this.chromadbService.consultar({ coleccion: "enfermedades", contenido: mensaje })
    const enfermedades = res.documents
    // - Guarda la información de las enfermedades en el primer elemento del historial.
    // - Se guarda el id de la enfermedad en "registroDeInfoDeEnfermedadesEnviadas".
    // - Si la información de una enfermedad ya fue enviada, no se volverá a guardar ni a enviar.
    for (let i = 0; i < enfermedades[0].length; i++) {
      if (!registroDeInfoDeEnfermedadesEnviadas.includes(res.ids[0][i])) {
        historial[0].content = historial[0].content + '\n' + enfermedades[0][i] + '\n'
        registroDeInfoDeEnfermedadesEnviadas.push(res.ids[0][i])
        console.log(registroDeInfoDeEnfermedadesEnviadas)
      }
    }
    return enfermedades
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

  async imprimirHistorial() {
    return historial
  }
  
  //------ Funciones relacionadas con el tiempo de espera para terminar la consulta -----

  async agregarMensaje(mensaje: any) {
    historial.push(mensaje)
    this.reiniciarTemporizador()
    console.log("Mensaje agregado.")
  }

  async vaciarHistorial() {
    historial = []
    console.log("El historial está vacio. El siguiente mensaje creará una nueva consulta.")
  }

  async reiniciarTemporizador() {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(this.vaciarHistorial, 120000)//Despues de un minuto sin mensajes nuevos, se da por terminada la consulta.
  }

  //------ SINTOMAS & DIAGNOSTICOS ------ (EN DESARROLLO).

  async getSintomas() {
    const sintomas = await this.prisma.sintoma.findMany()
    return sintomas
  }

  async getDiagnosticos() {
    const diagnosticos = await this.prisma.diagnostico.findMany()
    return diagnosticos
  }
}
