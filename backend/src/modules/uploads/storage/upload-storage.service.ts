import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalUploadStorageAdapter } from './local-upload-storage.adapter';
import { SupabaseUploadStorageAdapter } from './supabase-upload-storage.adapter';
import { ParsedStoredObject, UploadStorageAdapter } from './upload-storage-adapter';

@Injectable()
export class UploadStorageService {
  private readonly logger = new Logger(UploadStorageService.name);
  private warnedLocalProduction = false;

  constructor(
    private readonly config: ConfigService,
    private readonly local: LocalUploadStorageAdapter,
    private readonly supabase: SupabaseUploadStorageAdapter,
  ) {}

  adapter(): UploadStorageAdapter {
    const driver = this.config.get<string>('STORAGE_DRIVER', this.defaultDriver());
    if (driver === 'local') {
      this.warnIfProductionLocal();
      return this.local;
    }
    if (driver === 'supabase') return this.supabase;

    throw new ServiceUnavailableException(`Storage driver "${driver}" is not configured`);
  }

  parseUrl(url: string): ParsedStoredObject | null {
    return this.supabase.parseUrl(url) ?? this.local.parseUrl(url);
  }

  localAdapter(): LocalUploadStorageAdapter {
    return this.local;
  }

  private defaultDriver() {
    return this.config.get<string>('NODE_ENV') === 'production' ? 'none' : 'local';
  }

  private warnIfProductionLocal() {
    if (this.warnedLocalProduction || this.config.get<string>('NODE_ENV') !== 'production') return;
    this.warnedLocalProduction = true;
    this.logger.warn('STORAGE_DRIVER=local is not production-durable. Use STORAGE_DRIVER=supabase before production launch.');
  }
}
