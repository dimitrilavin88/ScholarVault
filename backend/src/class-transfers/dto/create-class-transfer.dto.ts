import { IsString, IsUUID, Matches } from 'class-validator';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CreateClassTransferDto {
  @IsString()
  @Matches(UUID_REGEX, { message: 'studentId must be a UUID' })
  studentId: string;

  @IsString()
  @Matches(UUID_REGEX, { message: 'fromClassroomId must be a UUID' })
  fromClassroomId: string;

  @IsString()
  @Matches(UUID_REGEX, { message: 'toClassroomId must be a UUID' })
  toClassroomId: string;
}
