import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateModuleDto {
  @ApiProperty({ example: 'Introdução ao JavaScript' })
  @IsString()
  title: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;

  @ApiProperty({ example: 'uuid-do-curso' })
  @IsString()
  courseId: string;

  @ApiPropertyOptional({ example: 'Neste módulo você aprenderá os conceitos básicos de JavaScript' })
  @IsOptional()
  @IsString()
  description?: string;
}