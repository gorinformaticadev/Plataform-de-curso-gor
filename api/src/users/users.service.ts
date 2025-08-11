import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, cpf } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 12);

    const data = {
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      cpf: createUserDto.cpf || null, // Tratar string vazia como null
      role: createUserDto.role || UserRole.STUDENT,
      avatar: createUserDto.avatar,
      bio: createUserDto.bio,
      studentCode: createUserDto.studentCode,
      userId: uuidv4(), // Garantir que userId seja único
    };

    // DEBUG: Log removido por questões de segurança - manter como referência
    // console.log('Creating user with data:', data);

    try {
      const user = await this.prisma.user.create({
        data,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          bio: true,
          createdAt: true,
          cpf: true,
        },
      });
      // DEBUG: Log removido por questões de segurança - manter como referência
      // console.log('User created successfully:', user);
      return user;
    } catch (error) {
      // Manter apenas o log de erro sem detalhes sensíveis
      console.error('Error creating user');
      throw error;
    }
  }

  async findAll(
    role?: UserRole | 'all',
    searchTerm?: string,
    page = 1,
    pageSize = 10,
    isActive?: string,
  ) {
    const where: Prisma.UserWhereInput = {};

    if (role && role !== 'all') {
      where.role = role;
    }

    if (isActive && isActive !== 'all') {
      where.isActive = isActive === 'true';
    }

    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          bio: true,
          isActive: true,
          cpf: true,
          avatar: true, // Adicionado o campo avatar
          _count: {
            select: { inscricoes: true },
          },
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        instructorProfile: true,
        inscricoes: {
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

  async findByEmailWithPassword(email: string) {
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

    if (cpf !== undefined) { // Permite que o CPF seja definido como null ou string vazia
      data.cpf = cpf;
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

  async deactivate(id: string) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
        select: {
          id: true,
          isActive: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Usuário com ID "${id}" não encontrado`);
      }
      throw error;
    }
  }

  async activate(id: string) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { isActive: true },
        select: {
          id: true,
          isActive: true,
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

  async findInstructors() {
    return this.prisma.user.findMany({
      where: {
        role: UserRole.INSTRUCTOR,
        instructorProfile: {
          isNot: null, // Ensure they have an instructor profile
        },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
