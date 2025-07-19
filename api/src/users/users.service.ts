import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { ...userData } = createUserDto;

    return this.prisma.user.create({
      data: {
        ...userData,
        role: UserRole.STUDENT, // Garante que o usuário seja um estudante
        student: {
          create: {}, // Cria um registro de estudante associado automaticamente
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
        student: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        createdAt: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        instructorProfile: true,
        _count: {
          select: {
            courses: true,
            enrollments: true,
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
    const user = await this.findById(id);
    
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        bio: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.findById(id);
    
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getTotalStudents() {
    return this.prisma.student.count();
  }

  async getNewStudentsLastMonth() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.prisma.student.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });
  }
}
