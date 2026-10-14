import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('Projects')
  getProjects(): { id: number; title: string }[] {
    return [
      {
        id: 1,
        title: 'AI Project Planner',
      },
      {
        id: 2,
        title: 'E-commerce App',
      },
    ];
  }
}
