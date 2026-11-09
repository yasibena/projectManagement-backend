import { Module } from '@nestjs/common';
import { AiAnalysisController } from './ai-analysis.controller.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { AiAnalysisService } from './ai-analysis.services.js';
import { TasksModule } from '../tasks/tasks.module.js';

@Module({
  imports: [ProjectsModule, TasksModule],
  controllers: [AiAnalysisController],
  providers: [AiAnalysisService],
})
export class AiAnalysisModule {}
