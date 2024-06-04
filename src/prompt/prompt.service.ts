import { Injectable } from '@nestjs/common';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PromptService {
  constructor(private prisma: PrismaService) { }

  async create(createPromptDto: CreatePromptDto) {
    const prompt = await this.prisma.prompt.create({
      data: createPromptDto,
    });
    console.log(prompt);
    return prompt;
  }

  async findAll() {
    const prompts = await this.prisma.prompt.findMany();
    return prompts;
  }

  async findOne(id: number) {
    const prompt = await this.prisma.prompt.findUnique({
      where: {
        id: id,
      },
    });
    return prompt;
  }

  async update(id: number, updatePromptDto: UpdatePromptDto) {
    const prompt = await this.prisma.prompt.update({
      where: {
        id: id,
      },
      data: updatePromptDto,
    });
    return prompt;
  }

  async remove(id: number) {
    const prompt = await this.prisma.prompt.delete({
      where: {
        id: id,
      },
    });
    return prompt;
  }
}
