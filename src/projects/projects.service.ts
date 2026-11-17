import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Project, ProjectDocument } from './project.schema.js';
import { CreateProjectDto } from './create-project.dto.js';
import { UpdateProjectDto } from './update-project.dto.js';

import { TasksService } from '../tasks/tasks.service.js';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    private readonly tasksService: TasksService,
  ) {}

  getProjects(ownerId: string, isAdmin = false) {
    return this.projectModel.find(isAdmin ? {} : { ownerId }).exec();
  }

  async getProjectSummaries(ownerId: string, isAdmin = false) {
    const projects = await this.getProjects(ownerId, isAdmin);

    return Promise.all(
      projects.map((project) => this.toProjectSummary(project, ownerId, isAdmin)),
    );
  }

  private async toProjectSummary(
    project: ProjectDocument,
    ownerId: string,
    isAdmin = false,
  ) {
    const { progress, ...taskStats } =
      await this.tasksService.getTaskStatsByProject(project.id, ownerId, isAdmin);

    return {
      id: project.id,
      title: project.title,
      description: project.description ?? null,
      deadline: project.deadline ?? null,
      lifecycleStatus: project.status ?? 'active',
      risk: project.risk ?? 'on_track',
      progress,
      taskStats,
    };
  }

  async createProject(createProjectDto: CreateProjectDto, ownerId: string) {
    const project = new this.projectModel({
      ...createProjectDto,
      ownerId,
    });

    return project.save();
  }

  async updateProject(
    id: string,
    updateProjectDto: UpdateProjectDto,
    ownerId: string,
    isAdmin = false,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid project ID');
    }

    const project = await this.projectModel
      .findOneAndUpdate(
        isAdmin ? { _id: id } : { _id: id, ownerId },
        updateProjectDto,
        {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async deleteProject(id: string, ownerId: string, isAdmin = false) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid project ID');
    }

    const project = await this.projectModel
      .findOneAndDelete(isAdmin ? { _id: id } : { _id: id, ownerId })
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async getProjectById(id: string, ownerId: string, isAdmin = false) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid project ID');
    }

    const project = await this.projectModel
      .findOne(isAdmin ? { _id: id } : { _id: id, ownerId })
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.toProjectSummary(project, ownerId, isAdmin);
  }
}
