import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { TasksModule } from '../tasks/tasks.module.js';

@Module({
  imports:[ProjectsModule,TasksModule],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
