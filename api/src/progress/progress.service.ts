import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async updateProgress(lessonId: string, updateProgressDto: UpdateProgressDto, userId: string) {
    // Verificar se o usuário está matriculado no curso da aula
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Aula não encontrada');
    }

    if (lesson.module.course.enrollments.length === 0) {
      throw new ForbiddenException('Você não está matriculado neste curso');
    }

    // Criar ou atualizar progresso
    const progress = await this.prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        ...updateProgressDto,
        completedAt: updateProgressDto.completed ? new Date() : null,
      },
      create: {
        userId,
        lessonId,
        ...updateProgressDto,
        completedAt: updateProgressDto.completed ? new Date() : null,
      },
    });

    // Verificar se o curso foi completado
    await this.checkCourseCompletion(lesson.module.course.id, userId);

    return progress;
  }

  async getCourseProgress(courseId: string, userId: string) {
    // Verificar se o usuário está matriculado
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (!enrollment) {
      throw new ForbiddenException('Você não está matriculado neste curso');
    }

    // Buscar todas as aulas do curso
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                progress: {
                  where: { userId },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    // Calcular estatísticas
    const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
    const completedLessons = course.modules.reduce(
      (acc, module) => acc + module.lessons.filter(lesson => lesson.progress[0]?.completed).length,
      0,
    );

    const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      course: {
        id: course.id,
        title: course.title,
      },
      enrollment,
      progress: {
        totalLessons,
        completedLessons,
        progressPercentage,
      },
      modules: course.modules.map(module => ({
        id: module.id,
        title: module.title,
        order: module.order,
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          duration: lesson.duration,
          order: lesson.order,
          type: lesson.type,
          progress: lesson.progress[0] || null,
        })),
      })),
    };
  }

  async getUserProgress(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  include: {
                    progress: {
                      where: { userId },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return enrollments.map(enrollment => {
      const totalLessons = enrollment.course.modules.reduce(
        (acc, module) => acc + module.lessons.length,
        0,
      );
      const completedLessons = enrollment.course.modules.reduce(
        (acc, module) => acc + module.lessons.filter(lesson => lesson.progress[0]?.completed).length,
        0,
      );

      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        enrollment,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          thumbnail: enrollment.course.thumbnail,
        },
        progress: {
          totalLessons,
          completedLessons,
          progressPercentage,
        },
      };
    });
  }

  private async checkCourseCompletion(courseId: string, userId: string) {
    // Buscar todas as aulas do curso
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                progress: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    if (!course) return;

    const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
    const completedLessons = course.modules.reduce(
      (acc, module) => acc + module.lessons.filter(lesson => lesson.progress[0]?.completed).length,
      0,
    );

    // Se completou todas as aulas, marcar curso como concluído
    if (totalLessons > 0 && completedLessons === totalLessons) {
      await this.prisma.enrollment.update({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    }
  }
}