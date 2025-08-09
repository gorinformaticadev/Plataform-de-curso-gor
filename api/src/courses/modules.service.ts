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

    const newModule = await this.prisma.module.create({
      data: {
        ...createModuleDto,
      },
      include: {
        lessons: true, // Renomeado para contents no frontend
      },
    });

    // O frontend espera 'contents', então vamos mapear 'lessons' para 'contents'
    const { lessons, ...moduleData } = newModule;
    return {
      ...moduleData,
      contents: lessons,
    };
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
  async reorderModules(modules: { id: string; order: number }[], userId: string) {
    // Verificar se o usuário tem permissão para editar os módulos
    // Isso pode ser feito verificando se todos os módulos pertencem a cursos do instrutor
    for (const moduleData of modules) {
      const module = await this.prisma.module.findUnique({
        where: { id: moduleData.id },
        include: {
          course: true,
        },
      });

      if (!module) {
        throw new NotFoundException(`Módulo com ID ${moduleData.id} não encontrado`);
      }

      if (module.course.instructorId !== userId) {
        throw new ForbiddenException('Você não tem permissão para reordenar este módulo');
      }
    }

    const transaction = modules.map((module) =>
      this.prisma.module.update({
        where: { id: module.id },
        data: { order: module.order },
      }),
    );
    return this.prisma.$transaction(transaction);
  }
}