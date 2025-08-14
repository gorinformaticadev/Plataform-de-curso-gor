import { IsArray, IsString, IsNumber, ArrayNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderLessonItemDto {
  @ApiProperty({ example: 'uuid-da-licao' })
  @IsString()
  id: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;
}

export class ReorderLessonDto {
  @ApiProperty({ type: [ReorderLessonItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderLessonItemDto)
  lessons: ReorderLessonItemDto[];
}