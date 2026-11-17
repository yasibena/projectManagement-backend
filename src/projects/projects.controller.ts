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

import { CreateProjectDto } from './create-project.dto.js';
import { UpdateProjectDto } from './update-project.dto.js';
import { ProjectsService } from './projects.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { JwtPayload } from '../auth/jwt.strategy.js';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  getProjects(@Request() request: { user: JwtPayload }) {
    return this.projectsService.getProjectSummaries(
      request.user.sub,
      request.user.role === 'admin',
    );
  }

  @Get(':id')
  getprojectById(
    @Param('id') id: string,
    @Request() request: { user: JwtPayload },
  ) {
    return this.projectsService.getProjectById(
      id,
      request.user.sub,
      request.user.role === 'admin',
    );
  }

  @Post()
  createProject(
    @Body() createProjectDto: CreateProjectDto,
    @Request() request: { user: JwtPayload },
  ) {
    return this.projectsService.createProject(createProjectDto, request.user.sub);
  }

  @Patch(':id')
  updateProject(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() request: { user: JwtPayload },
  ) {
    return this.projectsService.updateProject(
      id,
      updateProjectDto,
      request.user.sub,
      request.user.role === 'admin',
    );
  }

  @Delete(':id')
  deleteProject(
    @Param('id') id: string,
    @Request() request: { user: JwtPayload },
  ) {
    return this.projectsService.deleteProject(
      id,
      request.user.sub,
      request.user.role === 'admin',
    );
  }
}
