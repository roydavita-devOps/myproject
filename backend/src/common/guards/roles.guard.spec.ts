import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleName, RoleScope } from '@prisma/client';
import { RolesGuard } from './roles.guard';

function createContext(role: RoleName): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({
        user: {
          id: 'user-id',
          tenantId: 'tenant-id',
          email: 'admin@example.com',
          role,
          scope: RoleScope.TENANT,
        },
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('allows a user with an accepted role', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue([RoleName.TENANT_ADMIN]) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext(RoleName.TENANT_ADMIN))).toBe(true);
  });

  it('rejects a user without an accepted role', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue([RoleName.TENANT_ADMIN]) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(createContext(RoleName.EDITOR))).toThrow(ForbiddenException);
  });
});
