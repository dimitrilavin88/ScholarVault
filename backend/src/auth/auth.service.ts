import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from '../entities/teacher.entity';
import { AuditService } from '../common/audit.service';
import { TeacherRole } from '../entities/teacher.entity';

/**
 * Phase 1: Simple email + password (stored hash) with JWT.
 * Phase 2: Replace with AWS Cognito (InitiateAuth, GetUser); validate Cognito JWT instead of issuing our own.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,
    private readonly jwtService: JwtService,
    private readonly audit: AuditService,
  ) {}

  async login(email: string, password: string): Promise<{ access_token: string; user: LoginUser }> {
    const teacher = await this.teacherRepo.findOne({
      where: { email: email.trim().toLowerCase() },
      relations: ['school'],
    });
    if (!teacher) {
      this.audit.log('UNKNOWN', 'LOGIN_FAIL', { email, reason: 'user_not_found' });
      throw new UnauthorizedException('Invalid credentials');
    }
    // Phase 1: placeholder password (no real hash). Phase 2: verify via Cognito.
    const placeholderOk =
      process.env.PLACEHOLDER_PASSWORD != null
        ? password === process.env.PLACEHOLDER_PASSWORD
        : teacher.passwordHash === `placeholder:${password}`;
    const validPassword = !!teacher.passwordHash && placeholderOk;
    if (!validPassword) {
      this.audit.log(teacher.id, 'LOGIN_FAIL', { email, reason: 'bad_password' });
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = {
      sub: teacher.id,
      email: teacher.email,
      role: teacher.role,
      schoolId: teacher.schoolId,
    };
    const access_token = this.jwtService.sign(payload);
    this.audit.log(teacher.id, 'LOGIN_SUCCESS', { email });
    const user: LoginUser = {
      id: teacher.id,
      email: teacher.email,
      role: teacher.role,
      schoolId: teacher.schoolId,
    };
    return { access_token, user };
  }

  async validateUser(payload: JwtPayload): Promise<Teacher | null> {
    const teacher = await this.teacherRepo.findOne({
      where: { id: payload.sub },
      relations: ['school'],
    });
    return teacher ?? null;
  }
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: TeacherRole;
  schoolId: string;
}

export interface LoginUser {
  id: string;
  email: string;
  role: TeacherRole;
  schoolId: string;
}
