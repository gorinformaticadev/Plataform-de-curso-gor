import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalCourses,
      totalRevenue,
      totalPurchases,
      usersByRole,
      coursesByStatus
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.purchase.aggregate({
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
      }),
      this.prisma.purchase.count({
        where: { status: 'COMPLETED' }
      }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: true
      }),
      this.prisma.course.groupBy({
        by: ['status'],
        _count: true
      })
    ]);

    return {
      totalUsers,
      totalCourses,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalPurchases,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count;
        return acc;
      }, {}),
      coursesByStatus: coursesByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {})
    };
  }

  async getUsersCount() {
    const users = await this.prisma.user.groupBy({
      by: ['role'],
      _count: true
    });

    return {
      total: users.reduce((sum, item) => sum + item._count, 0),
      admins: users.find(u => u.role === 'ADMIN')?._count || 0,
      instructors: users.find(u => u.role === 'INSTRUCTOR')?._count || 0,
      students: users.find(u => u.role === 'STUDENT')?._count || 0
    };
  }

  async getCoursesCount() {
    const courses = await this.prisma.course.groupBy({
      by: ['status'],
      _count: true
    });

    return {
      total: courses.reduce((sum, item) => sum + item._count, 0),
      published: courses.find(c => c.status === 'PUBLISHED')?._count || 0,
      draft: courses.find(c => c.status === 'DRAFT')?._count || 0,
      archived: courses.find(c => c.status === 'ARCHIVED')?._count || 0
    };
  }

  async getRevenue() {
    const revenue = await this.prisma.purchase.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' }
    });

    const monthlyRevenue = await this.prisma.purchase.findMany({
      where: { status: 'COMPLETED' },
      select: { amount: true, createdAt: true }
    });

    return {
      total: revenue._sum.amount || 0,
      monthly: monthlyRevenue
    };
  }

  async getRecentActivity() {
    const recentPurchases = await this.prisma.purchase.findMany({
      where: { status: 'COMPLETED' },
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const recentEnrollments = await this.prisma.enrollment.findMany({
      include: {
        user: { select: { name: true } },
        course: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return {
      purchases: recentPurchases.map(p => ({
        user: p.user.name,
        action: `Comprou o curso ${p.course.title}`,
        time: p.createdAt,
        type: 'purchase'
      })),
      enrollments: recentEnrollments.map(e => ({
        user: e.user.name,
        action: `Inscreveu-se no curso ${e.course.title}`,
        time: e.createdAt,
        type: 'enrollment'
      }))
    };
  }
}
