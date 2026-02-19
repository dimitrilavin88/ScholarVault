import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dob must be YYYY-MM-DD' })
  dob?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  uniqueStudentIdentifier?: string;
}
