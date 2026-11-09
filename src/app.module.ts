import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProjectsModule } from './projects/projects.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AiAnalysisModule } from './ai-analysis/ai-analysis.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGODB_URI!),

    ProjectsModule,

    TasksModule,

    DashboardModule,

    AuthModule,

    AiAnalysisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
