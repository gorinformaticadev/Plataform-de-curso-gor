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
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Cursos')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo curso' })
  @ApiResponse({ status: 201, description: 'Curso criado com sucesso' })
  create(@Body() createCourseDto: CreateCourseDto, @Request() req) {
    return this.coursesService.create(createCourseDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cursos publicados' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'level', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de cursos' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('categoryId') categoryId?: string,
    @Query('level') level?: string,
  ) {
    return this.coursesService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      categoryId,
      level,
    );
  }

  @Get('my-courses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar cursos do instrutor logado' })
  @ApiResponse({ status: 200, description: 'Lista de cursos do instrutor' })
  getInstructorCourses(@Request() req) {
    return this.coursesService.getInstructorCourses(req.user.id);
  }

  @Get('active/count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Contar cursos ativos' })
  @ApiResponse({ status: 200, description: 'Número de cursos ativos' })
  countActiveCourses() {
    return this.coursesService.countActiveCourses();
  }

  @Get('new-last-month')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Contar novos cursos no último mês' })
  @ApiResponse({ status: 200, description: 'Número de novos cursos' })
  countNewCoursesLastMonth() {
    return this.coursesService.countNewCoursesLastMonth();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Buscar curso por slug' })
  @ApiResponse({ status: 200, description: 'Dados do curso' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  findBySlug(@Param('slug') slug: string, @Request() req) {
    const userId = req.user?.id;
    return this.coursesService.findBySlug(slug, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar curso por ID' })
  @ApiResponse({ status: 200, description: 'Dados do curso' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.id;
    return this.coursesService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar curso' })
  @ApiResponse({ status: 200, description: 'Curso atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para editar' })
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto, @Request() req) {
    return this.coursesService.update(id, updateCourseDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar curso' })
  @ApiResponse({ status: 200, description: 'Curso deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para deletar' })
  remove(@Param('id') id: string, @Request() req) {
    return this.coursesService.remove(id, req.user.id);
  }
}
