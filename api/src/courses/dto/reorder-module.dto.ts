import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ModuleReorderDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNumber()
  order: number;
}

export class ReorderModulesDto {
  @ApiProperty({ type: [ModuleReorderDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModuleReorderDto)
  modules: ModuleReorderDto[];
}