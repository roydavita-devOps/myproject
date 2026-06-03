import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { MalwareScannerService } from './malware-scanner.service';
import { LocalUploadStorageAdapter } from './storage/local-upload-storage.adapter';
import { UploadStorageService } from './storage/upload-storage.service';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [CommonModule],
  controllers: [UploadsController],
  providers: [MalwareScannerService, LocalUploadStorageAdapter, UploadStorageService, UploadsService],
  exports: [UploadStorageService, UploadsService],
})
export class UploadsModule {}
