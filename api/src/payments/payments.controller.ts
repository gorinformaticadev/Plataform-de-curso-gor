import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Pagamentos')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar pagamento para curso' })
  @ApiResponse({ status: 201, description: 'Pagamento criado com sucesso' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  @ApiResponse({ status: 409, description: 'Usuário já possui o curso' })
  createPayment(@Body() createPaymentDto: CreatePaymentDto, @Request() req) {
    return this.paymentsService.createPayment(createPaymentDto, req.user.id);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirmar pagamento' })
  @ApiResponse({ status: 200, description: 'Pagamento confirmado com sucesso' })
  @ApiResponse({ status: 404, description: 'Compra não encontrada' })
  confirmPayment(@Body() confirmPaymentDto: ConfirmPaymentDto) {
    return this.paymentsService.confirmPayment(
      confirmPaymentDto.purchaseId,
      confirmPaymentDto.transactionId,
    );
  }

  @Get('my-purchases')
  @ApiOperation({ summary: 'Listar compras do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de compras' })
  getUserPurchases(@Request() req) {
    return this.paymentsService.getUserPurchases(req.user.id);
  }

  @Get('my-sales')
  @ApiOperation({ summary: 'Listar vendas do instrutor' })
  @ApiResponse({ status: 200, description: 'Lista de vendas' })
  getInstructorSales(@Request() req) {
    return this.paymentsService.getInstructorSales(req.user.id);
  }
}