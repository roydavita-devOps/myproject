import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { MalwareScannerService } from './malware-scanner.service';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [CommonModule],
  controllers: [UploadsController],
  providers: [MalwareScannerService, UploadsService],
})
export class UploadsModule {}
