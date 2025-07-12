import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPaymentDto {
  @ApiProperty({ example: 'uuid-da-compra' })
  @IsString()
  purchaseId: string;

  @ApiProperty({ example: 'transaction-id-from-payment-gateway' })
  @IsString()
  transactionId: string;
}