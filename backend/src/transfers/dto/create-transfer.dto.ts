import { IsString, IsOptional, IsUUID, IsIn, Matches, MaxLength, ValidateIf } from 'class-validator';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CreateTransferDto {
  /** 'outbound' = sending district requests transfer; 'inbound' = receiving district requests student in */
  @IsOptional()
  @IsString()
  @IsIn(['outbound', 'inbound'])
  requestType?: 'outbound' | 'inbound';

  /** Required for outbound; set from lookup for inbound */
  @ValidateIf((o) => o.requestType !== 'inbound')
  @IsString()
  @Matches(UUID_REGEX, { message: 'studentId must be a UUID' })
  studentId?: string;

  /** Required for inbound (verification); optional for outbound */
  @ValidateIf((o) => o.requestType === 'inbound')
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dob must be YYYY-MM-DD' })
  dob?: string;

  @IsString()
  @Matches(UUID_REGEX, { message: 'oldDistrictId must be a UUID' })
  oldDistrictId: string;

  /** Required for outbound; set from teacher's district for inbound */
  @ValidateIf((o) => o.requestType !== 'inbound')
  @IsString()
  @Matches(UUID_REGEX, { message: 'newDistrictId must be a UUID' })
  newDistrictId?: string;

  /** Required for inbound: student ID from previous district (e.g. DEMO-001) */
  @ValidateIf((o) => o.requestType === 'inbound')
  @IsString()
  @MaxLength(255)
  uniqueStudentIdentifier?: string;

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
