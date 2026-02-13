import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Phase 1: Local file-based audit logging.
 * Phase 2: Replace with AWS CloudWatch Logs / audit stream.
 */
@Injectable()
export class AuditService {
  private readonly logDir = process.env.AUDIT_LOG_DIR || path.join(process.cwd(), 'logs');
  private readonly auditFile = path.join(this.logDir, 'audit.log');
  private readonly errorFile = path.join(this.logDir, 'error.log');

  constructor() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(actor: string, action: string, details: Record<string, unknown> = {}): void {
    const entry = {
      timestamp: new Date().toISOString(),
      actor,
      action,
      ...details,
    };
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(this.auditFile, line);
  }

  error(message: string, error?: Error): void {
    const entry = {
      timestamp: new Date().toISOString(),
      message,
      stack: error?.stack,
    };
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(this.errorFile, line);
  }
}
