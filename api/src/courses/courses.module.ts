import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { ModulesService } from './modules.service';
import { ModulesController } from './modules.controller';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';

@Module({
  controllers: [CoursesController, ModulesController, LessonsController],
  providers: [CoursesService, ModulesService, LessonsService],
  exports: [CoursesService, ModulesService, LessonsService],
})
export class CoursesModule {}