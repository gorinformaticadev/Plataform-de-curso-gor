import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModulesService {
  constructor(private prisma: PrismaService) {}

  async create(createModuleDto: CreateModuleDto, userId: string) {
    // Verificar se o usuário é o instrutor do curso
    const course = await this.prisma.course.findUnique({
      where: { id: createModuleDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    if (course.instructorId !== userId) {
      throw new ForbiddenException('Você não tem permissão para adicionar módulos a este curso');
    }

    return this.prisma.module.create({
      data: {
        ...createModuleDto,
      },
      include: {
        lessons: true,
      },
    });
  }

  async findOne(id: string) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!module) {
      throw new NotFoundException('Módulo não encontrado');
    }

    return module;
  }

  async update(id: string, updateModuleDto: UpdateModuleDto, userId: string) {
    // Verificar se o usuário é o instrutor do curso
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!module) {
      throw new NotFoundException('Módulo não encontrado');
    }

    if (module.course.instructorId !== userId) {
      throw new ForbiddenException('Você não tem permissão para editar este módulo');
    }

    return this.prisma.module.update({
      where: { id },
      data: updateModuleDto,
      include: {
        lessons: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    // Verificar se o usuário é o instrutor do curso
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!module) {
      throw new NotFoundException('Módulo não encontrado');
    }

    if (module.course.instructorId !== userId) {
      throw new ForbiddenException('Você não tem permissão para deletar este módulo');
    }

    return this.prisma.module.delete({
      where: { id },
    });
  }
}