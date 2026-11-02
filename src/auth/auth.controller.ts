import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';

import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import type { JwtPayload } from './jwt.strategy.js';
import { LoginDto } from './login.dto.js';
import { RegisterDto } from './register.dto.js';

const AUTH_COOKIE_NAME = 'access_token';
const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.COOKIE_SAME_SITE === 'none' ? ('none' as const) : ('lax' as const),
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);

    response.cookie(AUTH_COOKIE_NAME, result.accessToken, authCookieOptions);

    return result.user;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(AUTH_COOKIE_NAME, authCookieOptions);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Request() request: { user: JwtPayload }) {
    return request.user;
  }
}
