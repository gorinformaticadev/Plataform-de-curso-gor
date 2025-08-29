import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ReorderModulesDto } from './dto/reorder-module.dto';

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
          include: {
            content: true, // Incluir o conteúdo da lição
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

  /**
   * Reordena módulos de um curso de forma atômica
   * @param reorderModulesDto - Lista de módulos com suas novas posições
   * @param userId - ID do usuário que está fazendo a reordenação
   */
  async reorderModules(reorderModulesDto: ReorderModulesDto, userId: string) {
    const { modules } = reorderModulesDto;

    if (modules.length === 0) {
      throw new BadRequestException('Lista de módulos não pode estar vazia');
    }

    // Verificar se o primeiro módulo existe e validar permissões
    const firstModule = await this.prisma.module.findUnique({
      where: { id: modules[0].id },
      include: {
        course: true,
      },
    });

    if (!firstModule) {
      throw new NotFoundException('Módulo não encontrado');
    }

    if (firstModule.course.instructorId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para reordenar estes módulos'
      );
    }

    // Validar se todos os módulos pertencem ao mesmo curso
    const moduleIds = modules.map(m => m.id);
    const allModules = await this.prisma.module.findMany({
      where: { 
        id: { in: moduleIds },
        courseId: firstModule.courseId 
      }
    });

    if (allModules.length !== modules.length) {
      throw new BadRequestException(
        'Todos os módulos devem pertencer ao mesmo curso'
      );
    }

    // Validar se não há ordens duplicadas
    const orders = modules.map(m => m.order);
    const uniqueOrders = [...new Set(orders)];
    if (orders.length !== uniqueOrders.length) {
      throw new BadRequestException('Ordens devem ser únicas');
    }

    // Executar reordenação em transação atômica
    const updatedModules = await this.prisma.$transaction(
      modules.map((module) =>
        this.prisma.module.update({
          where: { id: module.id },
          data: { order: module.order },
          include: {
            lessons: {
              orderBy: {
                order: 'asc',
              },
              include: {
                content: true, // Incluir o conteúdo da lição
              },
            },
          },
        }),
      ),
    );

    // Mapear os resultados para o formato esperado pelo frontend
    return {
      success: true,
      message: 'Módulos reordenados com sucesso',
      modules: updatedModules.map(module => {
        const { lessons, ...moduleData } = module;
        return {
          ...moduleData,
          contents: lessons.map(lesson => ({
            ...lesson,
            contents: lesson.content?.content || [] // Mapear conteúdo da lição
          }))
        };
      })
    };
  }
}