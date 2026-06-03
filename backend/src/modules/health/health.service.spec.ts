import { ConfigService } from '@nestjs/config';
import { HealthService } from './health.service';

describe('HealthService', () => {
  const config = {
    get: jest.fn((key: string, defaultValue: string) => defaultValue),
  } as unknown as ConfigService;

  it('reports liveness as ok', () => {
    const service = new HealthService({} as never, config);

    expect(service.live().status).toBe('ok');
  });

  it('reports database as ok when the query succeeds', async () => {
    const prisma = { $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };
    const service = new HealthService(prisma as never, config);

    await expect(service.database()).resolves.toMatchObject({ status: 'ok' });
  });

  it('reports database as error when the query fails', async () => {
    const prisma = { $queryRaw: jest.fn().mockRejectedValue(new Error('connection refused')) };
    const service = new HealthService(prisma as never, config);

    await expect(service.database()).resolves.toMatchObject({ status: 'error' });
  });

  it('reports storage and cache as not configured by default', async () => {
    const service = new HealthService({} as never, config);

    await expect(service.storage()).resolves.toMatchObject({ status: 'not_configured' });
    expect(service.cache().status).toBe('not_configured');
  });
});
