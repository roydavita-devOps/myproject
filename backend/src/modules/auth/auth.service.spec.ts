import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { BusinessType, RoleName, RoleScope, TenantStatus, UserStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AuthService } from './auth.service';

describe('AuthService registration slug ownership', () => {
  it('registers without a user-provided slug and generates a unique temporary tenant slug', async () => {
    const { service, tx } = createService();

    await service.register({
      businessName: 'Izakaya Ramen',
      adminName: 'Owner',
      email: 'owner@example.com',
      password: 'Password12345',
      businessType: BusinessType.RESTAURANT,
    });

    expect(tx.tenant.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        name: 'Izakaya Ramen',
        slug: expect.stringMatching(/^izakaya-ramen-[a-f0-9]{4}$/),
        status: TenantStatus.TRIAL,
      }),
    }));
    expect(tx.domain.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        domain: expect.stringMatching(/^izakaya-ramen-[a-f0-9]{4}\.example\.test$/),
      }),
    }));
  });

  it('keeps existing explicit slug flows compatible', async () => {
    const { service, tx } = createService();

    await service.register({
      businessName: 'Legacy Tenant',
      slug: 'legacy-tenant',
      adminName: 'Owner',
      email: 'legacy@example.com',
      password: 'Password12345',
      businessType: BusinessType.WARTEG,
    });

    expect(tx.tenant.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ slug: 'legacy-tenant' }),
    }));
    expect(tx.domain.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ domain: 'legacy-tenant.example.test' }),
    }));
  });

  it('still rejects an explicit duplicate slug', async () => {
    const { service, tx } = createService();
    tx.tenant.findUnique.mockResolvedValueOnce({ id: 'existing-tenant', slug: 'taken-slug' });

    await expect(service.register({
      businessName: 'Duplicate Tenant',
      slug: 'taken-slug',
      adminName: 'Owner',
      email: 'duplicate@example.com',
      password: 'Password12345',
      businessType: BusinessType.CAFE,
    })).rejects.toBeInstanceOf(BadRequestException);
  });
});

function createService() {
  const role = { id: 'role-1', name: RoleName.TENANT_ADMIN, scope: RoleScope.TENANT };
  const tx = {
    role: {
      upsert: jest.fn().mockResolvedValue(role),
    },
    tenant: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(({ data }) => Promise.resolve({ id: 'tenant-1', ...data })),
    },
    template: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'template-1', name: 'restaurant-default' }),
    },
    subscription: {
      create: jest.fn().mockResolvedValue({ id: 'subscription-1' }),
    },
    theme: {
      create: jest.fn().mockResolvedValue({ id: 'theme-1' }),
    },
    website: {
      create: jest.fn().mockResolvedValue({ id: 'website-1' }),
    },
    domain: {
      create: jest.fn().mockResolvedValue({ id: 'domain-1' }),
    },
    user: {
      create: jest.fn(({ data }) => Promise.resolve({
        id: 'user-1',
        tenantId: data.tenantId,
        email: data.email,
        emailVerifiedAt: null,
        onboardingCompleted: data.onboardingCompleted,
        status: UserStatus.ACTIVE,
        role,
      })),
    },
    emailVerificationToken: {
      create: jest.fn().mockResolvedValue({ id: 'verification-1' }),
    },
  };
  const prisma = {
    $transaction: jest.fn((callback: (client: typeof tx) => Promise<unknown>) => callback(tx)),
    refreshToken: {
      create: jest.fn().mockResolvedValue({ id: 'refresh-1' }),
    },
  } as unknown as PrismaService;
  const jwt = { signAsync: jest.fn().mockResolvedValue('access-token') } as unknown as JwtService;
  const config = {
    get: jest.fn((key: string, defaultValue?: unknown) => {
      if (key === 'ROOT_DOMAIN') return 'example.test';
      if (key === 'JWT_REFRESH_EXPIRES_IN_DAYS') return 30;
      return defaultValue;
    }),
  } as unknown as ConfigService;
  const email = {} as unknown as EmailService;

  return {
    service: new AuthService(prisma, jwt, config, email),
    tx,
  };
}
