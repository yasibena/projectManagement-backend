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

import { Task, TaskDocument } from '../tasks/task.schema.js';
import { TasksService } from '../tasks/tasks.service.js';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
    private readonly tasksService: TasksService,

    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
  ) { }
  
  getProjects() {
    return this.projectModel.find().exec();
  }

  async createProject(createProjectDto: CreateProjectDto) {
    const project = new this.projectModel(createProjectDto);

    return project.save();
  }

  async updateProject(id: string, updateProjectDto: UpdateProjectDto) {
    return this.projectModel
      .findByIdAndUpdate(id, updateProjectDto, {
        new: true,
      })
      .exec();
  }

  async deleteProject(id: string) {
    return this.projectModel.findByIdAndDelete(id).exec();
  }

  async getProjectById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid project ID');
    }

    const project = await this.projectModel.findById(id).exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const taskStats = await this.tasksService.getTaskStatsByProject(project.id);

    return {
      ...project.toObject(),
      taskStats,
    };
  }
}
