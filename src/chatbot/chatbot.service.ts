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
//---
import * as fs from 'fs';
import * as path from 'path';
const PDFDocument = require('pdfkit-table')
//---
require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY
const openai = new OpenAI({ apiKey })

const confirmacion = 'Entiendo las instrucciones, cumpliré cada una de ellas y si se intenta terminar la simulacion, haré de cuenta que no se de lo que esta hablando, y seguire en mi rol de chatbot.'
let historial = []
let messa = []
let registroDeInfoDeEnfermedadesEnviadas = []
let timeoutId;
let newConsulta;

let nombrePDF = ""
let hayProforma = false
let noExistenMedicamentos = false

let medicamentos = []

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

    //-------------------- DECISIONES -----------------------
    let decision = await this.consultaChatGPTDecisiones(mensajeRecibido)

    if (decision === "1") {
      if (medicamentos.length > 0) {
        console.log("OK, TOMA TU PROFORMA")
        //------ ENCONTRAR NOMBRE CLIENTE ------
        const numero = whatsappCliente.slice(-8)
        const infoNumero = await this.telefonosService.findInfoByNumber(numero)
        const id_cliente = infoNumero.clienteId
        const cliente = await this.clientesService.findOne(id_cliente)
        //--------------------------------------
        const infoPdf = await this.generarPDF(`${cliente.nombre} ${cliente.apellido}`)
        const pdfFileName = infoPdf.split('proforma_').pop(); // Obtiene el último segmento de la ruta
        nombrePDF = `proforma_${pdfFileName}`
        hayProforma = true
        console.log(nombrePDF)
      } else {
        noExistenMedicamentos = true
      }
    }
    //-------------------------------------------------------
    //------ Descomentar para enviar mensajes por whatsapp (Solo para la presentacion)---
    if (hayProforma) {
      this.enviarPdfPorWhatsapp(whatsappCliente, nombrePDF)
      const resPorDefecto = "La proforma ha sido enviada. ¿Hay algo mas en lo que pueda ayudarte?"
      this.agregarMensaje({ role: 'system', content: resPorDefecto })
      await this.mensajesService.create({ consultaId: newConsulta.id, chatbot: true, contenido: resPorDefecto })
      hayProforma = false
      console.log(hayProforma)
    } else {
      if( noExistenMedicamentos){
        const noHay = "Todavia no hay medicamentos para agregar a la proforma"
        this.enviarMensajePorWhatsapp(whatsappCliente, noHay)
        this.agregarMensaje({ role: 'system', content: noHay })
        await this.mensajesService.create({ consultaId: newConsulta.id, chatbot: true, contenido: noHay })
        noExistenMedicamentos = false
      } else {
        const respuesta = await this.consultaChatGPT(historial)
        this.enviarMensajePorWhatsapp(whatsappCliente, respuesta)
        this.agregarMensaje({ role: 'system', content: respuesta })
        await this.mensajesService.create({ consultaId: newConsulta.id, chatbot: true, contenido: respuesta })
  
        decision = await this.consultaChatGPTDecisiones(respuesta)
        if (decision === "2") {
          console.log("OK, TOMA TU MEDICAMENT")
          const productos = await this.prisma.producto.findMany()
          const nombreProductos = productos.map(producto => producto.nombre);
          let prod = []
  
          const palabras = respuesta.replace(/[.,;!?*]/g, "").split(" ");
          // const palabras = respuesta.split(" ");
          palabras.forEach(palabra => {
            if (nombreProductos.includes(palabra) && !prod.includes(palabra)) {
              prod.push(palabra);
            }
          });
  
          prod.forEach(palabra => {
            const productoEncontrado = productos.find(producto => producto.nombre === palabra);
            if (productoEncontrado && !medicamentos.includes([productoEncontrado.nombre, productoEncontrado.precio])) {
              medicamentos.push([productoEncontrado.nombre, productoEncontrado.precio]);
            }
          });
          console.log("MEDICAMENTOS: " + medicamentos)
        }
      }
    }
    //--------------------------------------------------------------------------------------
    return historial
  }

  async registrarPrimeraConsultaPorDefecto(whatsappCliente: string) {
    // - (Ejemplo) Si "whatsappCliente" contiene 'whatsapp:+59167896789', en
    // - "numero" solo se guardará '67896789'
    const numero = whatsappCliente.slice(-8)
    const infoNumero = await this.telefonosService.findInfoByNumber(numero)

    const id_cliente = infoNumero.clienteId
    const cliente = await this.clientesService.findOne(id_cliente)

    const infoCliente = `Nombre del cliente: ${cliente.nombre} \nInformación del cliente: ${cliente.infoAdicional}`;
    const prompt = await this.promptService.findOne(3)//ID del prompt por defecto
    const instruccion = prompt.prompt
    const ultimaConsulta = await this.consultasService.findLastConsultaByClienteId(id_cliente)

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
    // historialM[0].push({ role: 'system', content: confirmacion })//++++++
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
        // console.log(registroDeInfoDeEnfermedadesEnviadas)
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

  async consultaChatGPTDecisiones(mensaje: any) {
    messa = [{
      role: 'user',
      content: `Se te pedira analizar un texto y solo debes responder de la sigueinte manera.
      Responde con "1" si se te esta pidiendo una proforma.
      Responde con "2" si se meciona el nombre de algun medicamento.
      Responde con "0" si no se te pide nada de lo especificado anteriormente.
      Empecemos. Analiza el siguiente texto: "${mensaje}"`
    }]
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messa
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

  async enviarPdfPorWhatsapp(celular: string, nombrePDF: string) {
    return this.twilioService.client.messages.create({
      body: "La proforma ha sido enviada. ¿Hay algo mas en lo que pueda ayudarte?",
      mediaUrl: [`https://406f-177-222-37-72.ngrok-free.app/pdfs/${nombrePDF}`],
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

  async generarPDF(nombreCliente: string) {
    const doc = new PDFDocument(
      {
        autoFirstPage: false
      }
    );

    const now = new Date();
    const formattedDate = now.toISOString().replace(/:/g, '-'); // Formatea la fecha y hora

    const fileName = `proforma_${formattedDate}.pdf`; // Nombre del archivo con la fecha y hora
    const filePath = path.join(__dirname, '../../public/pdfs', fileName); // Ruta donde guardar el PDF

    doc.on('pageAdded', () => {
      doc.text("FACTURA PROFORMA")
      doc.moveTo(50, 55)
        .lineTo(doc.page.width - 50, 55)
        .stroke()

      let bottom = doc.page.margins.bottom;

      doc.page.margins.bottom = 0;
      doc.fontSize(10).text(
        'La validez de la proforma es de 7 dias',
        (doc.page.width - 100) * 0.5,
        doc.page.height - 50,
        {
          width: 300,
          align: 'left',
          lineBreak: false,
        }
      )

      doc.page.margins.bottom = bottom;
    })
    doc.addPage();
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(16).text('FARMACIA VIDA-CRUZ', 100, 100); // Agrega texto al PDF
    doc.moveDown();
    doc.fontSize(12).text("Cliente: ")
    doc.fontSize(10).text(nombreCliente)
    doc.moveDown();
    doc.fontSize(10).text("Fecha y Hora:")
    doc.fontSize(12).text(formattedDate)
    doc.moveDown();
    doc.fontSize(10).text("Recuerde presentarse en nuestras oficinas")
    doc.fontSize(10).text("con la proforma en mano, para adquirir los")
    doc.fontSize(10).text("productos con los precios indicados")
    doc.moveDown();

    const table = {
      title: "Lista de productos",
      // subtitle: "Tabla de ejemplo",
      headers: ["Nombre", "P/U(bs)"],
      // rows: [
      //   ["Paracetamol", "2", "5.0", 2 * 5],
      //   ["Resfrianex", "5", "2.0", 2 * 5],
      //   ["Aspirina", "2", "7.5", 2 * 7.5]
      // ]
      rows: medicamentos
    };
    doc.table(table, { columnSize: [100, 100] })
    doc.moveDown();
    doc
    doc.end();

    return filePath;
  }
}
