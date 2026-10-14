import { Injectable } from '@nestjs/common';

import { ProjectsService } from '../projects/projects.service.js';
import { TasksService } from '../tasks/tasks.service.js';

@Injectable()
export class DashboardService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
  ) {}

  async getDashboard() {
    const projects = await this.projectsService.getProjects();
    const tasks = await this.tasksService.getTasks();

    const projectStats = await Promise.all(
      projects.map(async (project) => {
        const taskStats = await this.tasksService.getTaskStatsByProject(
          project._id.toString(),
        );

        return {
          ...project.toObject(),
          taskStats,
        };
      }),
    );

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
      (task) => task.status === 'completed',
    ).length;

    const overallProgress =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const now = new Date();

    const needsAttention = projects.filter(
      (project) =>
        project.status !== 'completed' &&
        project.deadline &&
        new Date(project.deadline) < now,
    ).length;

    return {
      activeProjects: projects.filter((project) => project.status === 'active')
        .length,
      completedTasks,
      overallProgress,
      needsAttention,
      projects: projectStats,
    };
  }
}
