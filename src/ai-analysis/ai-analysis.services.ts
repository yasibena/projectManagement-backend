import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service.js';
import { TasksService } from '../tasks/tasks.service.js';
import type { TaskDocument } from '../tasks/task.schema.js';
import { GroqService } from './groq.service.js';

type GroqInsight = {
  type?: string;
  title?: string;
  description?: string;
  recommendation?: string;
  message?: string;
};

type GroqAnalysis = {
  healthMessage?: string;
  insights?: GroqInsight[];
};

type NormalizedInsight = {
  type: string;
  title: string;
  description: string;
  recommendation: string;
};

const INSIGHT_TYPES = new Set(['info', 'warning', 'critical']);

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

    const prompt = `Analyze this project-management workspace. Use only the data provided below.
Do not invent facts.

Return ONLY a valid JSON object (no markdown, no code fences) with this exact shape:
{
  "healthMessage": "1-2 sentence summary of overall project health",
  "insights": [
    {
      "type": "info" | "warning" | "critical",
      "title": "short insight title (max 8 words)",
      "description": "1-2 sentence explanation grounded in the data",
      "recommendation": "one concrete, actionable next step"
    }
  ]
}

Return 2 to 4 insights, ordered by priority (critical first). Every insight must be grounded in the data below.

Projects:
${JSON.stringify(projects, null, 2)}

Tasks:
${JSON.stringify(tasks, null, 2)}
`;

    const raw = await this.groqService.generate(prompt);
    const analysis = this.parseAnalysis(raw);
    const insights = this.normalizeInsights(analysis.insights);

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

    const healthMessage = this.buildHealthMessage(
      analysis.healthMessage,
      healthRisk,
      projects.length,
      tasks.length,
    );

    return {
      analysisProvider: 'groq',
      projectsCount: projects.length,
      tasksCount: tasks.length,
      overdueCount: overdue.length,
      health: {
        score: healthScore,
        risk: healthRisk,
        title: `Project Health: ${healthLabel}`,
        message: healthMessage,
        projectId: projects[0]?.id ?? null,
      },
      insights,
    };
  }

  private parseAnalysis(raw: string): GroqAnalysis {
    const cleaned = raw
      .replace(/^\s*```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();

    const direct = this.tryParse(cleaned);
    if (direct) {
      return direct;
    }

    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');

    if (start !== -1 && end > start) {
      const embedded = this.tryParse(cleaned.slice(start, end + 1));

      if (embedded) {
        return embedded;
      }
    }

    const plain = this.toPlainText(cleaned);

    return {
      healthMessage: plain,
      insights: [
        {
          type: 'info',
          title: 'Workspace analysis',
          description: plain,
          recommendation: 'Review the project and task details above.',
        },
      ],
    };
  }

  private tryParse(value: string): GroqAnalysis | null {
    try {
      const parsed = JSON.parse(value) as GroqAnalysis;

      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  }

  private normalizeInsights(insights: GroqInsight[] | undefined) {
    if (!Array.isArray(insights)) {
      return [] as NormalizedInsight[];
    }

    return insights
      .map((insight): NormalizedInsight | null => {
        const type = (insight.type ?? 'info').toLowerCase();
        const title = this.truncate(insight.title ?? '', 100);
        const description = this.truncate(
          insight.description ?? insight.message ?? '',
          400,
        );
        const recommendation = this.truncate(
          insight.recommendation ?? '',
          300,
        );

        if (!title && !description) {
          return null;
        }

        return {
          type: INSIGHT_TYPES.has(type) ? type : 'info',
          title: title || description,
          description,
          recommendation,
        };
      })
      .filter((insight): insight is NormalizedInsight => insight !== null)
      .slice(0, 4);
  }

  private buildHealthMessage(
    candidate: string | undefined,
    risk: string,
    projectCount: number,
    taskCount: number,
  ) {
    const value = candidate?.trim() ?? '';
    const containsReportFormatting = /(^|\n)\s*(#{1,6}\s|\|.*\||[-*]\s)/m.test(value);

    if (value && !containsReportFormatting && value.length <= 240) {
      return value;
    }

    const riskLabel = risk === 'at_risk'
      ? 'At risk'
      : risk === 'medium_risk'
        ? 'Medium risk'
        : 'On track';

    return `${riskLabel}: ${projectCount} project${projectCount === 1 ? '' : 's'} and ${taskCount} task${taskCount === 1 ? '' : 's'} analyzed. Review deadlines, progress, and ownership for the next action.`;
  }

  private toPlainText(value: string) {
    const plain = value
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[#*_`>]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return this.truncate(plain, 280);
  }

  private truncate(value: string, maxLength: number) {
    const collapsed = value.replace(/\s+/g, ' ').trim();

    if (collapsed.length <= maxLength) {
      return collapsed;
    }

    return `${collapsed.slice(0, maxLength - 1).trimEnd()}…`;
  }
}