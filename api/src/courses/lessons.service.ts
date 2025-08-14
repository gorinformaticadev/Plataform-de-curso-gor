import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async create(createLessonDto: CreateLessonDto, userId: string) {
    const { moduleId, content, ...lessonData } = createLessonDto;

    // Verificar se o usuário é o instrutor do curso
    const module = await this.prisma.module.findUnique({
      where: { id: moduleId },
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

    const lesson = await this.prisma.lesson.create({
      data: {
        ...lessonData,
        module: {
          connect: { id: moduleId },
        },
      },
    });

    if (content) {
      await this.prisma.lessonContent.create({
        data: {
          lessonId: lesson.id,
          content: content as any,
        },
      });
    }

    return lesson;
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        content: true, // Incluir o conteúdo da lição
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lição não encontrada');
    }

    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto, userId: string) {
    const lessonToUpdate = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: true,
          },
        },
        content: true, // Incluir o conteúdo existente para verificar
      },
    });

    if (!lessonToUpdate) {
      throw new NotFoundException('Lição não encontrada');
    }

    if (lessonToUpdate.module.course.instructorId !== userId) {
      throw new ForbiddenException('Você não tem permissão para editar esta lição');
    }

    const { content, ...lessonData } = updateLessonDto;

    const updatedLesson = await this.prisma.$transaction(async (prisma) => {
      const lesson = await prisma.lesson.update({
        where: { id },
        data: lessonData,
      });

      if (content !== undefined) { // Verifica se 'content' foi fornecido no DTO
        if (lessonToUpdate.content) {
          // Se já existe conteúdo, atualiza
          await prisma.lessonContent.update({
            where: { lessonId: id },
            data: { content: content as any },
          });
        } else {
          // Se não existe conteúdo, cria um novo
          await prisma.lessonContent.create({
            data: {
              lessonId: id,
              content: content as any,
            },
          });
        }
      }

      return lesson;
    });

    return this.prisma.lesson.findUnique({
        where: { id: updatedLesson.id },
        include: { content: true }
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
  async reorderLessons(lessons: { id: string; order: number }[], userId: string) {
    if (lessons.length === 0) {
      return;
    }

    // Obter a primeira lição para verificar o módulo e o curso
    const firstLesson = await this.prisma.lesson.findUnique({
      where: { id: lessons[0].id },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!firstLesson) {
      throw new NotFoundException('Lição não encontrada');
    }

    if (firstLesson.module.course.instructorId !== userId) {
      throw new ForbiddenException('Você não tem permissão para reordenar estas lições');
    }

    return this.prisma.$transaction(
      lessons.map((lesson) =>
        this.prisma.lesson.update({
          where: { id: lesson.id },
          data: { order: lesson.order },
        }),
      ),
    );
  }
}
