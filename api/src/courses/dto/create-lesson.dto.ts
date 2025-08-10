import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LessonType } from '@prisma/client';

class LessonContentDto {
  @ApiProperty({ enum: LessonType })
  @IsEnum(LessonType)
  type: LessonType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  // quizData can be added here later
}

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

  @ApiProperty({ type: [LessonContentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonContentDto)
  contents: LessonContentDto[];
}