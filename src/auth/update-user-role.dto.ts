import { IsIn } from 'class-validator';

import type { UserRole } from './user.schema.js';

export class UpdateUserRoleDto {
  @IsIn(['user', 'admin'])
  role: UserRole;
}
