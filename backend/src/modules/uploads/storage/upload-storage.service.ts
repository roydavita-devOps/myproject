import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalUploadStorageAdapter } from './local-upload-storage.adapter';
import { UploadStorageAdapter } from './upload-storage-adapter';

@Injectable()
export class UploadStorageService {
  constructor(
    private readonly config: ConfigService,
    private readonly local: LocalUploadStorageAdapter,
  ) {}

  adapter(): UploadStorageAdapter {
    const driver = this.config.get<string>('STORAGE_DRIVER', 'local');
    if (driver === 'local') return this.local;

    throw new ServiceUnavailableException(`Storage driver "${driver}" is not configured`);
  }
}
