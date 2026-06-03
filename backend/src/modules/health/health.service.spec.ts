import { ConfigService } from '@nestjs/config';
import { HealthService } from './health.service';

describe('HealthService', () => {
  const config = {
    get: jest.fn((key: string, defaultValue: string) => defaultValue),
  } as unknown as ConfigService;
  const storage = {
    adapter: jest.fn(() => ({ health: jest.fn().mockResolvedValue({ driver: 'local', path: '/tmp/uploads' }) })),
  };

  it('reports liveness as ok', () => {
    const service = new HealthService({} as never, config, storage as never);

    expect(service.live().status).toBe('ok');
  });

  it('reports database as ok when the query succeeds', async () => {
    const prisma = { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };
    const service = new HealthService(prisma as never, config, storage as never);

    await expect(service.database()).resolves.toMatchObject({ status: 'ok' });
  });

  it('reports database as error when the query fails', async () => {
    const prisma = { $queryRaw: jest.fn().mockRejectedValue(new Error('connection refused')) };
    const service = new HealthService(prisma as never, config, storage as never);

    await expect(service.database()).resolves.toMatchObject({ status: 'error' });
  });

  it('reports storage and cache as not configured by default', async () => {
    const service = new HealthService({} as never, config, storage as never);

    await expect(service.storage()).resolves.toMatchObject({ status: 'not_configured' });
    expect(service.cache().status).toBe('not_configured');
  });

  it('checks storage through the configured adapter', async () => {
    const localConfig = {
      get: jest.fn((key: string, defaultValue: string) => (key === 'STORAGE_DRIVER' ? 'local' : defaultValue)),
    } as unknown as ConfigService;
    const service = new HealthService({} as never, localConfig, storage as never);

    await expect(service.storage()).resolves.toMatchObject({ status: 'ok', checks: { driver: 'local' } });
  });
});
