import { Injectable } from '@nestjs/common';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConsultasService {
  constructor(private prisma: PrismaService) {}
  
  async create(createConsultaDto: CreateConsultaDto) {
    const consulta = await this.prisma.consulta.create({
      data: createConsultaDto,
    });
    console.log(consulta);
    return consulta;
  }

  async findAll() {
    const consultas = await this.prisma.consulta.findMany();
    return consultas;
  }

  async findOne(id: number) {
    const consulta = await this.prisma.consulta.findUnique({
      where: { id },
    });
    return consulta;
  }

  async update(id: number, updateConsultaDto: UpdateConsultaDto) {
    const consulta = await this.prisma.consulta.update({
      where: { id },
      data: updateConsultaDto,
    });
    return consulta;
  }

  async remove(id: number) {
    const consulta = await this.prisma.consulta.delete({
      where: { id },
    });
    return consulta;
  }

  //------ OTROS ------
  async findAllByClienteId(clienteId: number) {
    const consultas = await this.prisma.consulta.findMany({
      where: { clienteId },
    });
    return consultas;
  }

  async findLastConsultaByClienteId(clienteId: number) {
    const consulta = await this.prisma.consulta.findFirst({
      where: { clienteId },
      orderBy: { createdAt: 'desc' },
    });
    return consulta;
  }
}
