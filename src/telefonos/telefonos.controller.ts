import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TelefonosService } from './telefonos.service';
import { CreateTelefonoDto } from './dto/create-telefono.dto';
import { UpdateTelefonoDto } from './dto/update-telefono.dto';

@Controller('telefonos')
export class TelefonosController {
  constructor(private readonly telefonosService: TelefonosService) {}

  @Post()
  create(@Body() createTelefonoDto: CreateTelefonoDto) {
    return this.telefonosService.create(createTelefonoDto);
  }

  @Get()
  findAll() {
    return this.telefonosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.telefonosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTelefonoDto: UpdateTelefonoDto) {
    return this.telefonosService.update(+id, updateTelefonoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.telefonosService.remove(+id);
  }
}
