import { IsString, Matches } from 'class-validator';

// Accept standard UUID shape (8-4-4-4-12 hex) so seed IDs like d0000000-0000-0000-... work
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class AddStudentDto {
  @IsString()
  @Matches(UUID_REGEX, { message: 'studentId must be a UUID' })
  studentId: string;
}
