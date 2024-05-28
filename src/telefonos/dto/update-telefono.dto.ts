import { PartialType } from '@nestjs/mapped-types';
import { CreateTelefonoDto } from './create-telefono.dto';

export class UpdateTelefonoDto extends PartialType(CreateTelefonoDto) {}
