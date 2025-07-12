import { IsBoolean, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProgressDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiPropertyOptional({ example: 120, description: 'Tempo assistido em segundos' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  watchTime?: number;
}