import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LessonType } from '@prisma/client';

export class CreateLessonDto {
  @ApiProperty({ example: 'Variáveis e Tipos de Dados' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Nesta aula você aprenderá sobre variáveis e tipos de dados em JavaScript' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://video.url' })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ example: 300, description: 'Duração em segundos' })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;

  @ApiPropertyOptional({ enum: LessonType, default: LessonType.VIDEO })
  @IsOptional()
  @IsEnum(LessonType)
  type?: LessonType;

  @ApiProperty({ example: 'uuid-do-modulo' })
  @IsString()
  moduleId: string;
}