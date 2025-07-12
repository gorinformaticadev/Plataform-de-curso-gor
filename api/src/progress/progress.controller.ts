import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { ProgressService } from './progress.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Progresso')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('lesson/:lessonId')
  @ApiOperation({ summary: 'Atualizar progresso de uma aula' })
  @ApiResponse({ status: 200, description: 'Progresso atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Aula não encontrada' })
  @ApiResponse({ status: 403, description: 'Usuário não matriculado no curso' })
  updateProgress(
    @Param('lessonId') lessonId: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @Request() req,
  ) {
    return this.progressService.updateProgress(lessonId, updateProgressDto, req.user.id);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Obter progresso de um curso' })
  @ApiResponse({ status: 200, description: 'Progresso do curso' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  @ApiResponse({ status: 403, description: 'Usuário não matriculado no curso' })
  getCourseProgress(@Param('courseId') courseId: string, @Request() req) {
    return this.progressService.getCourseProgress(courseId, req.user.id);
  }

  @Get('my-progress')
  @ApiOperation({ summary: 'Obter progresso de todos os cursos do usuário' })
  @ApiResponse({ status: 200, description: 'Progresso de todos os cursos' })
  getUserProgress(@Request() req) {
    return this.progressService.getUserProgress(req.user.id);
  }
}