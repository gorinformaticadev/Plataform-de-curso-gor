import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, cpf } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 12);

    return this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        cpf,
        role: UserRole.STUDENT,
        student: {
          create: {
            cpf,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        createdAt: true,
        student: true,
        cpf: true,
      },
    });
  }

  async findAll(role?: UserRole | 'TODOS', searchTerm?: string) {
    const where: Prisma.UserWhereInput = {};

    if (role && role !== 'TODOS') {
      where.role = role;
    }

    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        bio: true,
        _count: {
          select: { enrollments: true },
        },
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        instructorProfile: true,
        student: true,
        enrollments: {
          include: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, cpf, ...restOfDto } = updateUserDto;

    const data: Prisma.UserUpdateInput = { ...restOfDto };

    if (password) {
      data.password = await bcrypt.hash(password, 12);
    }

    if (cpf) {
      data.cpf = cpf;
      // Also update the student's CPF if the user is a student
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (user && user.role === 'STUDENT') {
        await this.prisma.student.update({
          where: { userId: id },
          data: { cpf },
        });
      }
    }

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          bio: true,
          updatedAt: true,
          cpf: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Usuário com ID "${id}" não encontrado`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Usuário com ID "${id}" não encontrado`);
      }
      throw error;
    }
  }

  async getTotalStudents() {
    return this.prisma.user.count({ where: { role: UserRole.STUDENT } });
  }

  async getNewStudentsLastMonth() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.prisma.user.count({
      where: {
        role: UserRole.STUDENT,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });
  }
}
