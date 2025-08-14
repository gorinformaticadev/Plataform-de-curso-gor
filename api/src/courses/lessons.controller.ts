import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ReorderLessonDto } from './dto/reorder-lesson.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Lições')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar nova lição' })
  @ApiResponse({ status: 201, description: 'Lição criada com sucesso' })
  create(@Body() createLessonDto: CreateLessonDto, @Request() req) {
    return this.lessonsService.create(createLessonDto, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar lição por ID' })
  @ApiResponse({ status: 200, description: 'Dados da lição' })
  @ApiResponse({ status: 404, description: 'Lição não encontrada' })
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar lição' })
  @ApiResponse({ status: 200, description: 'Lição atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Lição não encontrada' })
  @ApiResponse({ status: 403, description: 'Sem permissão para editar' })
  update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @Request() req,
  ) {
    return this.lessonsService.update(id, updateLessonDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar lição' })
  @ApiResponse({ status: 200, description: 'Lição deletada com sucesso' })
  @ApiResponse({ status: 404, description: 'Lição não encontrada' })
  @ApiResponse({ status: 403, description: 'Sem permissão para deletar' })
  remove(@Param('id') id: string, @Request() req) {
    return this.lessonsService.remove(id, req.user.id);
  }
  @Patch('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reordenar lições' })
  @ApiResponse({ status: 200, description: 'Lições reordenadas com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para reordenar' })
  reorder(@Body() reorderLessonDto: ReorderLessonDto, @Request() req) {
    return this.lessonsService.reorderLessons(reorderLessonDto.lessons, req.user.id);
  }
}