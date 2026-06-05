import { RoleName, RoleScope } from '@prisma/client';

export type AuthenticatedUser = {
  id: string;
  tenantId: string | null;
  email: string;
  onboardingCompleted: boolean;
  role: RoleName;
  scope: RoleScope;
};
