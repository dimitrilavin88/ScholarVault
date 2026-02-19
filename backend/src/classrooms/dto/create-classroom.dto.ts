import { IsString, MinLength, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateClassroomDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  gradeLevel?: string;

  @IsOptional()
  @IsBoolean()
  isHomeroom?: boolean;
}
