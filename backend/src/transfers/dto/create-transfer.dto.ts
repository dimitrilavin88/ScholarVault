import { IsString, IsOptional, IsUUID, Matches, MaxLength } from 'class-validator';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CreateTransferDto {
  @IsString()
  @Matches(UUID_REGEX, { message: 'studentId must be a UUID' })
  studentId: string;

  /** Optional; if provided, verified against student record */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dob must be YYYY-MM-DD' })
  dob?: string;

  @IsString()
  @Matches(UUID_REGEX, { message: 'oldDistrictId must be a UUID' })
  oldDistrictId: string;

  @IsString()
  @Matches(UUID_REGEX, { message: 'newDistrictId must be a UUID' })
  newDistrictId: string;

  @IsOptional()
  @IsString()
  @Matches(UUID_REGEX, { message: 'oldSchoolId must be a UUID' })
  oldSchoolId?: string;

  @IsOptional()
  @IsString()
  @Matches(UUID_REGEX, { message: 'newSchoolId must be a UUID' })
  newSchoolId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
