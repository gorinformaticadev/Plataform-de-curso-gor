import { IsString, IsNumber, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LessonType } from '@prisma/client';

export class CreateLessonDto {
  @ApiProperty({ example: 'Introdução ao React' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Nesta lição você aprenderá os conceitos básicos de React' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;

  @ApiProperty({ example: 'uuid-do-modulo' })
  @IsString()
  moduleId: string;

  @ApiProperty({ type: 'object', example: { type: 'doc', content: [] } })
  @IsObject()
  content: any;
}