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

  async findOne(id: number) {
    const telefono = await this.prisma.telefono.findUnique({
      where: { id },
    });
    return telefono;
  }

  async update(id: number, updateTelefonoDto: UpdateTelefonoDto) {
    const telefono = await this.prisma.telefono.update({
      where: { id },
      data: updateTelefonoDto,
    });
    return telefono;
  }

  async remove(id: number) {
    const telefono = await this.prisma.telefono.delete({
      where: { id },
    });
    return telefono;
  }

  //------ OTROS ------
  async findInfoByNumber(numero: string) {
    const telefono = await this.prisma.telefono.findFirst({
      where: { numero },
    });
    return telefono;
  }
}
