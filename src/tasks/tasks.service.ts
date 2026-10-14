import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateTaskDto } from './create-task.dto.js';
import { Task, TaskDocument } from './task.schema.js';
import { UpdateTaskDto } from './update.task.dto.js';

@Injectable()
export class TasksService {
  async getTaskStatsByProject(projectId: string) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    const total = await this.taskModel.countDocuments({ projectId }).exec();

    const completed = await this.taskModel
      .countDocuments({
        projectId,
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

  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
  ) {}

  async createTask(createTaskDto: CreateTaskDto) {
    const task = new this.taskModel(createTaskDto);

    return task.save();
  }

  async getTasks() {
    return this.taskModel.find().exec();
  }

  async getTasksByProject(projectId: string) {
    return this.taskModel.find({ projectId }).exec();
  }

  async updateTask(id: string, updateTaskDto: UpdateTaskDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid task ID');
    }

    const task = await this.taskModel
      .findByIdAndUpdate(id, updateTaskDto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async deleteTask(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      //400
      throw new BadRequestException('Invalid task ID');
    }

    const task = await this.taskModel.findByIdAndDelete(id).exec();

    if (!task) {
      //404
      throw new NotFoundException('Task not found');
    }

    return { message: 'Task deleted successfully' };
  }

  async getTaskStatusCountsByProject(projectId: string) {
    if (!Types.ObjectId.isValid(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    const total = await this.taskModel.countDocuments({ projectId }).exec();

    const completed = await this.taskModel
      .countDocuments({
        projectId,
        status: 'completed',
      })
      .exec();

    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, remaining: total - completed, progress };
  }
}
