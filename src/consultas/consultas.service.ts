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

  findOne(id: number) {
    return `This action returns a #${id} consulta`;
  }

  update(id: number, updateConsultaDto: UpdateConsultaDto) {
    return `This action updates a #${id} consulta`;
  }

  remove(id: number) {
    return `This action removes a #${id} consulta`;
  }
}
