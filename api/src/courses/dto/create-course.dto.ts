import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLevel, CourseStatus } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty({ example: 'Curso de JavaScript Completo' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Aprenda JavaScript do zero ao avançado' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'https://thumbnail.url' })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @ApiProperty({ example: 199.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ enum: CourseLevel, default: CourseLevel.BEGINNER })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiPropertyOptional({ example: 1200, description: 'Duração em minutos' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({ enum: CourseStatus, default: CourseStatus.DRAFT })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiProperty({ example: 'uuid-da-categoria' })
  @IsString()
  categoryId: string;
}