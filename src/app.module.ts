import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProjectsModule } from './projects/projects.module.js';
import { TasksModule } from './tasks/tasks.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AiAnalysisModule } from './ai-analysis/ai-analysis.module.js';

function validateEnvironment(config: Record<string, unknown>) {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'GROQ_API_KEY',
    'FRONTEND_ORIGIN',
  ];

  const missing = required.filter((name) => {
    const value = config[name];
    return typeof value !== 'string' || value.trim().length === 0;
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }

  return config;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
      }),
    }),

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
