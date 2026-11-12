import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service.js';
import { TasksService } from '../tasks/tasks.service.js';
import type { TaskDocument } from '../tasks/task.schema.js';
import { GroqService } from './groq.service.js';

@Injectable()
export class AiAnalysisService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
    private readonly groqService: GroqService,
  ) {}

  async analyze(userId: string) {
    const projects = await this.projectsService.getProjectSummaries(userId);
    const tasks = await this.tasksService.getTasks(userId);

    const prompt = ` Analyze this project-management workspace. Use only the data provided below.
Do not invent facts. Return practical recommendations.

Projects:
${JSON.stringify(projects, null, 2)}

Tasks:
${JSON.stringify(tasks, null, 2)}
`;

    const aiMessage = await this.groqService.generate(prompt);

    const insights: { type: string; message: string }[] = [];
    if (projects.length === 0) {
      insights.push({ type: 'info', message: 'No projects yet.' });
    }

    const overdue = tasks.filter(
      (t: TaskDocument) =>
        t.status !== 'completed' &&
        /* add deadline check if task has it */ false,
    );

    const healthScore = projects.length
      ? Math.round(
          projects.reduce((total, project) => total + project.progress, 0) /
            projects.length,
        )
      : 0;
    const healthRisk =
      healthScore < 40
        ? 'at_risk'
        : healthScore < 70
          ? 'medium_risk'
          : 'on_track';
    const healthLabel =
      healthRisk === 'at_risk'
        ? 'At Risk'
        : healthRisk === 'medium_risk'
          ? 'Medium Risk'
          : 'On Track';

    return {
      projectsCount: projects.length,
      tasksCount: tasks.length,
      overdueCount: overdue.length,
      health: {
        score: healthScore,
        risk: healthRisk,
        title: `Project Health: ${healthLabel}`,
        message: aiMessage,
        // message:
        //   healthRisk === 'at_risk'
        //     ? 'Project progress is behind schedule and needs immediate attention.'
        //     : healthRisk === 'medium_risk'
        //       ? 'Your project is making steady progress, but one critical dependency is putting the delivery timeline at risk.'
        //       : 'Your project is progressing well and remains on track.',
        projectId: projects[0]?.id ?? null,
      },
      insights: [
        {
          type: 'info',
          message: aiMessage,
        },
      ],
    };
  }
}
