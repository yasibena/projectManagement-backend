import { IsIn, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['todo', 'in_progress', 'completed'])
  status?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: string;
}
