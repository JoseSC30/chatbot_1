import { Injectable } from '@nestjs/common';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { UpdateMensajeDto } from './dto/update-mensaje.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MensajesService {
  constructor(private prisma: PrismaService) {}

  async create(createMensajeDto: CreateMensajeDto) {
    const mensaje = await this.prisma.mensaje.create({
      data: createMensajeDto,
    });
    console.log(mensaje);
    return mensaje;
  }

  async findAll() {
    const mensajes = await this.prisma.mensaje.findMany();
    return mensajes;
  }

  async findOne(id: number) {
    const mensaje = await this.prisma.mensaje.findUnique({
      where: { id },
    });
    return mensaje;
  }

  async update(id: number, updateMensajeDto: UpdateMensajeDto) {
    const mensaje = await this.prisma.mensaje.update({
      where: { id },
      data: updateMensajeDto,
    });
    return mensaje;
  }

  async remove(id: number) {
    const mensaje = await this.prisma.mensaje.delete({
      where: { id },
    });
    return mensaje;
  }

  //------ OTROS ------
  async findAllMensajesByConsultaId(consultaId: number) {
    const mensajes = await this.prisma.mensaje.findMany({
      where: { consultaId },
    });
    return mensajes;
  }
}
