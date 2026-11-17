import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { Roles } from './roles.decorator.js';
import { RolesGuard } from './roles.guard.js';
import { UpdateUserRoleDto } from './update-user-role.dto.js';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly authService: AuthService) {}

  @Get('users')
  listUsers() {
    return this.authService.listUsers();
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.authService.updateUserRole(id, updateUserRoleDto.role);
  }
}

@Controller('auth/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AuthAdminController {
  constructor(private readonly authService: AuthService) {}

  @Get('users')
  listUsers() {
    return this.authService.listUsers();
  }

  @Patch('users/:id/role')
  updateUserRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.authService.updateUserRole(id, updateUserRoleDto.role);
  }
}
