import { Injectable } from '@nestjs/common';
import { CreateTelefonoDto } from './dto/create-telefono.dto';
import { UpdateTelefonoDto } from './dto/update-telefono.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TelefonosService {
  constructor(private prisma: PrismaService) {}

  async create(createTelefonoDto: CreateTelefonoDto) {
    const telefono = await this.prisma.telefono.create({
      data: createTelefonoDto,
    });
    console.log(telefono);
    return telefono;
  }

  async findAll() {
    const telefonos = await this.prisma.telefono.findMany();
    return telefonos;
  }

  findOne(id: number) {
    return `This action returns a #${id} telefono`;
  }

  update(id: number, updateTelefonoDto: UpdateTelefonoDto) {
    return `This action updates a #${id} telefono`;
  }

  remove(id: number) {
    return `This action removes a #${id} telefono`;
  }
}
