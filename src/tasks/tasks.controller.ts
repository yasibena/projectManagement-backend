import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { CreateTaskDto } from './create-task.dto.js';
import { TasksService } from './tasks.service.js';
import { UpdateTaskDto } from './update.task.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { JwtPayload } from '../auth/jwt.strategy.js';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  getTasks(@Request() request: { user: JwtPayload }) {
    return this.tasksService.getTasks(
      request.user.sub,
      request.user.role === 'admin',
    );
  }

  @Get('project/:projectId')
  getTasksByProject(
    @Param('projectId') projectId: string,
    @Request() request: { user: JwtPayload },
  ) {
    return this.tasksService.getTasksByProject(
      projectId,
      request.user.sub,
      request.user.role === 'admin',
    );
  }

  @Post()
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @Request() request: { user: JwtPayload },
  ) {
    return this.tasksService.createTask(createTaskDto, request.user.sub);
  }

  @Patch(':id')
  updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() request: { user: JwtPayload },
  ) {
    return this.tasksService.updateTask(
      id,
      updateTaskDto,
      request.user.sub,
      request.user.role === 'admin',
    );
  }

  @Delete(':id')
  deleteTask(
    @Param('id') id: string,
    @Request() request: { user: JwtPayload },
  ) {
    return this.tasksService.deleteTask(
      id,
      request.user.sub,
      request.user.role === 'admin',
    );
  }

  @Get('project/:projectId/stats')
  getTaskStatsByProject(
    @Param('projectId') projectId: string,
    @Request() request: { user: JwtPayload },
  ) {
    return this.tasksService.getTaskStatsByProject(
      projectId,
      request.user.sub,
      request.user.role === 'admin',
    );
  }
}
