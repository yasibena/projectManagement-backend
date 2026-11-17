import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateTaskDto } from './create-task.dto.js';
import { Task, TaskDocument } from './task.schema.js';
import { UpdateTaskDto } from './update.task.dto.js';
import { Project, ProjectDocument } from '../projects/project.schema.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async getTaskStatsByProject(
    projectId: string,
    ownerId: string,
    isAdmin = false,
  ) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    const project = await this.projectModel
      .findOne(isAdmin ? { _id: projectId } : { _id: projectId, ownerId })
      .select('_id')
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const taskScope = isAdmin ? { projectId } : { projectId, ownerId };
    const total = await this.taskModel.countDocuments(taskScope).exec();

    const completed = await this.taskModel
      .countDocuments({
        ...taskScope,
        status: 'completed',
      })
      .exec();

    return {
      total,
      completed,
      remaining: total - completed,
      progress: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }

  async createTask(createTaskDto: CreateTaskDto, ownerId: string) {
    if (!Types.ObjectId.isValid(createTaskDto.projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    const project = await this.projectModel
      .findOne({ _id: createTaskDto.projectId, ownerId })
      .select('_id')
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const task = new this.taskModel({
      ...createTaskDto,
      ownerId,
    });

    return task.save();
  }

  getTasks(ownerId: string, isAdmin = false) {
    return this.taskModel.find(isAdmin ? {} : { ownerId }).exec();
  }

  async getTasksByProject(
    projectId: string,
    ownerId: string,
    isAdmin = false,
  ) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    const project = await this.projectModel
      .findOne(isAdmin ? { _id: projectId } : { _id: projectId, ownerId })
      .select('_id')
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.taskModel
      .find(isAdmin ? { projectId } : { projectId, ownerId })
      .exec();
  }

  async updateTask(
    id: string,
    updateTaskDto: UpdateTaskDto,
    ownerId: string,
    isAdmin = false,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid task ID');
    }

    const task = await this.taskModel
      .findOneAndUpdate(
        isAdmin ? { _id: id } : { _id: id, ownerId },
        updateTaskDto,
        {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async deleteTask(id: string, ownerId: string, isAdmin = false) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid task ID');
    }

    const task = await this.taskModel
      .findOneAndDelete(isAdmin ? { _id: id } : { _id: id, ownerId })
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return { message: 'Task deleted successfully' };
  }

  getTaskStatusCountsByProject(projectId: string, ownerId: string) {
    return this.getTaskStatsByProject(projectId, ownerId);
  }
}
