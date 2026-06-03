import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadStorageService } from '../uploads/storage/upload-storage.service';

type HealthState = 'ok' | 'degraded' | 'not_configured' | 'error';

type HealthResponse = {
  status: HealthState;
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  checks?: Record<string, unknown>;
};

@Injectable()
export class HealthService {
  private readonly serviceName = 'umkm-website-builder-backend';

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly uploadStorage: UploadStorageService,
  ) {}

  async check(): Promise<HealthResponse> {
    const database = await this.database();
    const storage = await this.storage();
    const cache = this.cache();

    return this.response(database.status === 'ok' ? 'ok' : 'degraded', {
      database: database.status,
      storage: storage.status,
      cache: cache.status,
    });
  }

  live(): HealthResponse {
    return this.response('ok');
  }

  async ready(): Promise<HealthResponse> {
    const database = await this.database();
    if (database.status !== 'ok') {
      throw new ServiceUnavailableException(this.response('error', { database: database.status }));
    }

    return this.response('ok', { database: database.status });
  }

  async database(): Promise<HealthResponse> {
    const startedAt = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.response('ok', { latencyMs: Date.now() - startedAt });
    } catch (error) {
      return this.response('error', {
        latencyMs: Date.now() - startedAt,
        message: error instanceof Error ? error.message : 'Database check failed',
      });
    }
  }

  async storage(): Promise<HealthResponse> {
    const driver = this.config.get<string>('STORAGE_DRIVER', 'none');
    if (driver === 'none') return this.response('not_configured', { driver });

    try {
      return this.response('ok', await this.uploadStorage.adapter().health());
    } catch (error) {
      return this.response('error', {
        driver,
        message: error instanceof Error ? error.message : 'Storage check failed',
      });
    }
  }

  cache(): HealthResponse {
    const driver = this.config.get<string>('CACHE_DRIVER', 'none');
    if (driver === 'none') return this.response('not_configured', { driver });

    return this.response('ok', { driver });
  }

  private response(status: HealthState, checks?: Record<string, unknown>): HealthResponse {
    return {
      status,
      service: this.serviceName,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      ...(checks ? { checks } : {}),
    };
  }
}
