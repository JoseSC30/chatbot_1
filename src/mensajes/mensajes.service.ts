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

  findOne(id: number) {
    return `This action returns a #${id} mensaje`;
  }

  update(id: number, updateMensajeDto: UpdateMensajeDto) {
    return `This action updates a #${id} mensaje`;
  }

  remove(id: number) {
    return `This action removes a #${id} mensaje`;
  }
}
