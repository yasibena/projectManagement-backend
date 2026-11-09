import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service.js';
import { TasksService } from '../tasks/tasks.service.js';
import type { TaskDocument } from '../tasks/task.schema.js';

@Injectable()
export class AiAnalysisService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
  ) {}

  async analyze(userId: string) {
    const projects = await this.projectsService.getProjectSummaries(userId);
    const tasks = await this.tasksService.getTasks(userId);

    const insights: { type: string; message: string }[] = [];
    if (projects.length === 0)
      insights.push({ type: 'info', message: 'No projects yet.' });

    const overdue = tasks.filter(
      (t: TaskDocument) =>
        t.status !== 'completed' && /* add deadline check if task has it */ false,
    );

    return {
      projectsCount: projects.length,
      tasksCount: tasks.length,
      overdueCount: overdue.length,
      insights,
    };
  }
}
