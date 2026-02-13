import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateWorkDto {
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  gradeLevel: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  subject: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
