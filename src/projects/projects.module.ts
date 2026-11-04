import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './project.schema.js';
import { TasksModule } from '../tasks/tasks.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Project.name,
        schema: ProjectSchema,
      },
    ]),
    TasksModule,
  ],

  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports:[ProjectsService]
})
export class ProjectsModule {}
