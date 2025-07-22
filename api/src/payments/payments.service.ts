import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CoursesService } from '../courses/courses.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private coursesService: CoursesService,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto, userId: string) {
    const { courseId } = createPaymentDto;

    // Verificar se o curso existe
    const course = await this.coursesService.findOne(courseId);
    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }

    // Verificar se o usuário já comprou o curso
    const existingPurchase = await this.prisma.purchase.findFirst({
      where: {
        userId,
        courseId,
        status: PaymentStatus.COMPLETED,
      },
    });

    if (existingPurchase) {
      throw new ConflictException('Você já possui este curso');
    }

    // Criar registro de compra
    const purchase = await this.prisma.purchase.create({
      data: {
        amount: course.price,
        status: PaymentStatus.PENDING,
        userId,
        courseId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Aqui você integraria com o Mercado Pago
    // const paymentLink = await this.createMercadoPagoPayment(purchase);

    return {
      purchase,
      // paymentLink,
      message: 'Compra criada com sucesso. Proceda com o pagamento.',
    };
  }

  async confirmPayment(purchaseId: string, transactionId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        course: true,
        user: true,
      },
    });

    if (!purchase) {
      throw new NotFoundException('Compra não encontrada');
    }

    // Atualizar status da compra
    const updatedPurchase = await this.prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId,
      },
    });

    // Criar matrícula no curso
    await this.prisma.enrollment.create({
      data: {
        userId: purchase.userId,
        courseId: purchase.courseId,
      },
    });

    return {
      purchase: updatedPurchase,
      message: 'Pagamento confirmado! Você já pode acessar o curso.',
    };
  }

  async getUserPurchases(userId: string) {
    return this.prisma.purchase.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
            instructor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getInstructorSales(instructorId: string) {
    return this.prisma.purchase.findMany({
      where: {
        course: {
          instructorId,
        },
        status: PaymentStatus.COMPLETED,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Método para integração com Mercado Pago (implementar)
  private async createMercadoPagoPayment(purchase: any) {
    // Implementar integração com Mercado Pago
    // Retornar link de pagamento
    return 'https://mercadopago.com/payment-link';
  }

  async getTotalRevenue() {
    const result = await this.prisma.purchase.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: PaymentStatus.COMPLETED,
      },
    });
    return result._sum.amount || 0;
  }

  async getNewRevenueLastMonth() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const result = await this.prisma.purchase.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: PaymentStatus.COMPLETED,
        createdAt: {
          gte: oneMonthAgo,
        },
      },
    });
    return result._sum.amount || 0;
  }
}
