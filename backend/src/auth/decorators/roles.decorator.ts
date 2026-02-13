import { SetMetadata } from '@nestjs/common';
import { TeacherRole } from '../../entities/teacher.entity';
import { ROLES_KEY } from '../guards/roles.guard';

export const Roles = (...roles: TeacherRole[]) => SetMetadata(ROLES_KEY, roles);
