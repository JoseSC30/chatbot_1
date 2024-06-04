import { Injectable } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto) {
    const cliente = await this.prisma.cliente.create({
      data: createClienteDto,
    });
    console.log(cliente);
    return cliente;
  }

  async findAll() {
    const clientes = await this.prisma.cliente.findMany();
    return clientes;    
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: {
        id: id,
      },
    });
    return cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto) {
    const cliente = await this.prisma.cliente.update({
      where: {
        id: id,
      },
      data: updateClienteDto,
    });
    return cliente;
  }

  async remove(id: number) {
    const cliente = await this.prisma.cliente.delete({
      where: {
        id: id,
      },
    });
    console.log("Cliente eliminado: \n\n", cliente);
    return cliente;
  }
}
