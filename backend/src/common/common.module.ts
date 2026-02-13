import { Global, Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { FileStorageService } from './file-storage.service';

@Global()
@Module({
  providers: [AuditService, FileStorageService],
  exports: [AuditService, FileStorageService],
})
export class CommonModule {}
