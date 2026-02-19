import { IsString, MinLength, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class UpdateClassroomDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  gradeLevel?: string;

  @IsOptional()
  @IsBoolean()
  isHomeroom?: boolean;
}
