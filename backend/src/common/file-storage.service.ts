import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Phase 1: Store files locally under district/student/year/filename.
 * Phase 2: Replace with AWS S3; use getPresignedUploadUrl/getPresignedDownloadUrl for S3 pre-signed URLs.
 */
@Injectable()
export class FileStorageService {
  private readonly baseDir =
    process.env.UPLOAD_BASE_DIR || path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  getLocalPath(districtId: string, studentId: string, year: string, filename: string): string {
    const dir = path.join(this.baseDir, districtId, studentId, year);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const ext = path.extname(filename) || '';
    const safeName = `${uuidv4()}${ext}`;
    return path.join(dir, safeName);
  }

  saveLocal(
    districtId: string,
    studentId: string,
    year: string,
    originalFilename: string,
    buffer: Buffer,
  ): string {
    const fullPath = this.getLocalPath(districtId, studentId, year, originalFilename);
    fs.writeFileSync(fullPath, buffer);
    // Return relative URL for API (e.g. /uploads/district/student/year/file)
    const relative = path.relative(this.baseDir, fullPath);
    return `/uploads/${relative.replace(/\\/g, '/')}`;
  }

  /**
   * Phase 1: Returns a placeholder "pre-signed" URL pointing to local server.
   * Phase 2: Generate real S3 pre-signed URL via AWS SDK (getSignedUrl).
   */
  getPresignedDownloadUrl(fileUrl: string): string {
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}${fileUrl}`;
  }

  /**
   * Phase 1: Not used for local uploads (we accept multipart and save locally).
   * Phase 2: Return S3 pre-signed POST URL for client-side upload.
   */
  getPresignedUploadUrl(
    districtId: string,
    studentId: string,
    year: string,
    filename: string,
  ): { url: string; key: string } {
    const key = `${districtId}/${studentId}/${year}/${uuidv4()}${path.extname(filename) || ''}`;
    return {
      url: `https://s3.amazonaws.com/placeholder-bucket/${key}`,
      key,
    };
  }

  /** Save proof document for a transfer (e.g. PDF/image). Returns relative URL. */
  saveTransferProof(transferId: string, originalFilename: string, buffer: Buffer): string {
    const dir = path.join(this.baseDir, 'transfers', transferId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const ext = path.extname(originalFilename) || '';
    const safeName = `${uuidv4()}${ext}`;
    const fullPath = path.join(dir, safeName);
    fs.writeFileSync(fullPath, buffer);
    const relative = path.relative(this.baseDir, fullPath);
    return `/uploads/${relative.replace(/\\/g, '/')}`;
  }

  getAbsolutePath(relativeFileUrl: string): string {
    const relative = relativeFileUrl.replace(/^\/uploads\//, '').replace(/\//g, path.sep);
    return path.join(this.baseDir, relative);
  }

  exists(relativeFileUrl: string): boolean {
    const abs = this.getAbsolutePath(relativeFileUrl);
    return fs.existsSync(abs);
  }
}
