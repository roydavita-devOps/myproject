import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  BusinessType,
  DomainStatus,
  DomainType,
  Prisma,
  RoleName,
  RoleScope,
  SubscriptionPlan,
  SubscriptionStatus,
  TenantStatus,
  TemplateStatus,
  UserStatus,
} from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

type AuthUser = {
  id: string;
  tenantId: string | null;
  email: string;
  role: { name: RoleName; scope: RoleScope };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const existingTenant = await this.prisma.tenant.findUnique({ where: { slug: dto.slug } });
    if (existingTenant) throw new BadRequestException('Tenant slug is already used');

    const passwordHash = await hash(dto.password, 12);
    const rootDomain = this.config.get<string>('ROOT_DOMAIN', 'localhost');

    const result = await this.prisma.$transaction(async (tx) => {
      const role = await tx.role.upsert({
        where: { name: RoleName.TENANT_ADMIN },
        create: { name: RoleName.TENANT_ADMIN, scope: RoleScope.TENANT },
        update: {},
      });
      const template = await this.findOrCreateTemplate(tx, dto.businessType);
      const tenant = await tx.tenant.create({
        data: { name: dto.businessName, slug: dto.slug, status: TenantStatus.TRIAL },
      });
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          roleId: role.id,
          name: dto.adminName,
          email: dto.email.toLowerCase(),
          passwordHash,
          status: UserStatus.ACTIVE,
        },
        include: { role: true },
      });
      await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.TRIALING,
          monthlyPrice: new Prisma.Decimal(0),
        },
      });
      const theme = await tx.theme.create({
        data: {
          tenantId: tenant.id,
          name: 'Default Theme',
          primaryColor: '#0f766e',
          secondaryColor: '#f59e0b',
          typography: { heading: 'Inter', body: 'Inter' },
        },
      });
      await tx.website.create({
        data: {
          tenantId: tenant.id,
          templateId: template.id,
          themeId: theme.id,
          businessName: dto.businessName,
        },
      });
      await tx.domain.create({
        data: {
          tenantId: tenant.id,
          domain: `${dto.slug}.${rootDomain}`,
          type: DomainType.SUBDOMAIN,
          status: DomainStatus.VERIFIED,
          verifiedAt: new Date(),
        },
      });

      return { user, tenant };
    });

    return this.issueTokens(result.user, ipAddress, userAgent);
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email.toLowerCase(),
        ...(dto.tenantSlug ? { tenant: { slug: dto.tenantSlug } } : {}),
      },
      include: { role: true, tenant: true },
    });

    if (!user || !(await compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.status !== UserStatus.ACTIVE || user.tenant?.status === TenantStatus.SUSPENDED) {
      throw new UnauthorizedException('Account is not active');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.issueTokens(user, ipAddress, userAgent);
  }

  async refresh(refreshToken: string, ipAddress?: string, userAgent?: string) {
    const tokenHash = await hashToken(refreshToken);
    const existing = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: { user: { include: { role: true, tenant: true } } },
    });
    if (!existing) throw new UnauthorizedException('Invalid refresh token');

    await this.prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(existing.user, ipAddress, userAgent);
  }

  async logout(userId: string, refreshToken: string) {
    const tokenHash = await hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { userId, tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findFirst({ where: { email: dto.email.toLowerCase() } });
    if (user) {
      const token = randomBytes(32).toString('hex');
      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: await hashToken(token),
          expiresAt: new Date(Date.now() + 1000 * 60 * 30),
        },
      });
    }
    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = await hashToken(dto.token);
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!resetToken) throw new BadRequestException('Invalid reset token');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: await hash(dto.newPassword, 12) },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: resetToken.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { success: true };
  }

  private async issueTokens(user: AuthUser, ipAddress?: string, userAgent?: string) {
    const payload = {
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role.name,
      scope: user.role.scope,
    };
    const accessToken = await this.jwt.signAsync(payload);
    const refreshToken = randomBytes(48).toString('hex');
    const refreshDays = this.config.get<number>('JWT_REFRESH_EXPIRES_IN_DAYS', 30);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await hashToken(refreshToken),
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role.name,
        scope: user.role.scope,
      },
    };
  }

  private async findOrCreateTemplate(tx: Prisma.TransactionClient, businessType: BusinessType) {
    const existing = await tx.template.findFirst({
      where: { businessType, status: TemplateStatus.ACTIVE },
    });
    if (existing) return existing;

    return tx.template.create({
      data: {
        name: `${businessType.toLowerCase()}-default`,
        businessType,
        status: TemplateStatus.ACTIVE,
        schema: {
          sections: ['hero', 'about', 'menu', 'reviews', 'gallery', 'location', 'contact'],
        },
      },
    });
  }
}

async function hashToken(token: string) {
  const { createHash } = await import('crypto');
  return createHash('sha256').update(token).digest('hex');
}
