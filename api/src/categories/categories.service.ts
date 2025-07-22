import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const slug = this.generateSlug(createCategoryDto.name);
    
    // Verificar se já existe categoria com mesmo slug
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      throw new ConflictException('Já existe uma categoria com este nome');
    }

    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        slug,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        _count: {
          select: {
            courses: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this._getCategoryDetails({ id });
  }

  async findBySlug(slug: string) {
    return this._getCategoryDetails({ slug });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const updateData: any = { ...updateCategoryDto };

    if (updateCategoryDto.name) {
      const newSlug = this.generateSlug(updateCategoryDto.name);
      const existingCategoryWithSlug = await this.prisma.category.findFirst({
        where: {
          slug: newSlug,
          id: { not: id }, // Exclui a categoria atual da verificação
        },
      });

      if (existingCategoryWithSlug) {
        throw new ConflictException('Já existe uma categoria com este nome');
      }
      updateData.slug = newSlug;
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Categoria com ID "${id}" não encontrada`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            courses: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    if (category._count.courses > 0) {
      throw new ConflictException('Não é possível deletar categoria que possui cursos');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  private async _getCategoryDetails(where: Prisma.CategoryWhereUniqueInput) {
    const category = await this.prisma.category.findUnique({
      where,
      include: {
        courses: {
          where: { status: 'PUBLISHED' },
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            _count: {
              select: {
                enrollments: true,
                reviews: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            courses: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}