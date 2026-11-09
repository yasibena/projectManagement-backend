import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AiAnalysisService } from './ai-analysis.services.js';
import type { JwtPayload } from '../auth/jwt.strategy.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';


@UseGuards(JwtAuthGuard)
@Controller('ai-analysis')
export class AiAnalysisController {
  constructor(private readonly aiAnalysisService: AiAnalysisService) {}

  @Get()
  analyze(@Request() request: { user: JwtPayload }) {
    return this.aiAnalysisService.analyze(request.user.sub);
  }
}
