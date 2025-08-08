import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async create(createLessonDto: CreateLessonDto, userId: string) {
    // Verificar se o usuário é o instrutor do curso
    const module = await this.prisma.module.findUnique({
      where: { id: createLessonDto.moduleId },
      include: {
        course: true,
      },
    });

    if (!module) {
      throw new NotFoundException('Módulo não encontrado');
    }

    if (module.course.instructorId !== userId) {
      throw new ForbiddenException('Você não tem permissão para adicionar lições a este módulo');
    }

    return this.prisma.lesson.create({
      data: {
        ...createLessonDto,
      },
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException('Lição não encontrada');
    }

    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto, userId: string) {
    // Verificar se o usuário é o instrutor do curso
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lição não encontrada');
    }

    if (lesson.module.course.instructorId !== userId) {
      throw new ForbiddenException('Você não tem permissão para editar esta lição');
    }

    return this.prisma.lesson.update({
      where: { id },
      data: updateLessonDto,
    });
  }

  async remove(id: string, userId: string) {
    // Verificar se o usuário é o instrutor do curso
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lição não encontrada');
    }

    if (lesson.module.course.instructorId !== userId) {
      throw new ForbiddenException('Você não tem permissão para deletar esta lição');
    }

    return this.prisma.lesson.delete({
      where: { id },
    });
  }
}