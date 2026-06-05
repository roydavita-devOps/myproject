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
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../../prisma/prisma.service';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { GoogleRegisterDto } from './dto/google-register.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

type AuthUser = {
  id: string;
  tenantId: string | null;
  email: string;
  emailVerifiedAt?: Date | null;
  onboardingCompleted: boolean;
  role: { name: RoleName; scope: RoleScope };
};

type TokenDelivery = {
  success: true;
  delivery: 'email' | 'console' | 'suppressed';
  token?: string;
};

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
    const passwordHash = await hash(dto.password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const role = await tx.role.upsert({
        where: { name: RoleName.TENANT_ADMIN },
        create: { name: RoleName.TENANT_ADMIN, scope: RoleScope.TENANT },
        update: {},
      });
      const tenant = await this.createTenantWorkspace(tx, {
        businessName: dto.businessName,
        slug: dto.slug,
        businessType: dto.businessType,
      });
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          roleId: role.id,
          name: dto.adminName,
          email: dto.email.toLowerCase(),
          passwordHash,
          onboardingCompleted: true,
          status: UserStatus.ACTIVE,
        },
        include: { role: true },
      });
      await this.createEmailVerificationToken(tx, user.id);

      return { user, tenant };
    });

    return this.issueTokens(result.user, ipAddress, userAgent);
  }

  async googleRegister(dto: GoogleRegisterDto, ipAddress?: string, userAgent?: string) {
    const profile = await this.verifyGoogleIdToken(dto.idToken);
    const passwordHash = await hash(randomBytes(32).toString('hex'), 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const role = await tx.role.upsert({
        where: { name: RoleName.TENANT_ADMIN },
        create: { name: RoleName.TENANT_ADMIN, scope: RoleScope.TENANT },
        update: {},
      });
      const tenant = await this.createTenantWorkspace(tx, {
        businessName: dto.businessName,
        slug: dto.slug,
        businessType: dto.businessType,
      });
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          roleId: role.id,
          name: profile.name,
          email: profile.email,
          passwordHash,
          googleSubject: profile.subject,
          emailVerifiedAt: profile.emailVerified ? new Date() : null,
          onboardingCompleted: true,
          status: UserStatus.ACTIVE,
        },
        include: { role: true },
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

  async googleLogin(dto: GoogleLoginDto, ipAddress?: string, userAgent?: string) {
    const profile = await this.verifyGoogleIdToken(dto.idToken);
    let user = await this.prisma.user.findFirst({
      where: {
        ...(dto.tenantSlug ? { tenant: { slug: dto.tenantSlug } } : {}),
        OR: [{ googleSubject: profile.subject }, { email: profile.email }],
      },
      include: { role: true, tenant: true },
    });

    if (!user) {
      if (dto.tenantSlug) throw new UnauthorizedException('Google account is not registered for this tenant');

      const passwordHash = await hash(randomBytes(32).toString('hex'), 12);
      const role = await this.prisma.role.upsert({
        where: { name: RoleName.TENANT_ADMIN },
        create: { name: RoleName.TENANT_ADMIN, scope: RoleScope.TENANT },
        update: {},
      });
      user = await this.prisma.user.create({
        data: {
          roleId: role.id,
          name: profile.name,
          email: profile.email,
          passwordHash,
          googleSubject: profile.subject,
          emailVerifiedAt: profile.emailVerified ? new Date() : null,
          onboardingCompleted: false,
          status: UserStatus.ACTIVE,
          lastLoginAt: new Date(),
        },
        include: { role: true, tenant: true },
      });
    }

    if (user.status !== UserStatus.ACTIVE || user.tenant?.status === TenantStatus.SUSPENDED) {
      throw new UnauthorizedException('Account is not active');
    }

    if (!user.googleSubject || !user.emailVerifiedAt) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleSubject: user.googleSubject ?? profile.subject,
          emailVerifiedAt: user.emailVerifiedAt ?? (profile.emailVerified ? new Date() : null),
          lastLoginAt: new Date(),
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    return this.issueTokens({
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt ?? (profile.emailVerified ? new Date() : null),
      onboardingCompleted: user.onboardingCompleted,
      role: user.role,
    }, ipAddress, userAgent);
  }

  async completeOnboarding(userId: string, dto: CompleteOnboardingDto, ipAddress?: string, userAgent?: string) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, tenant: true },
    });
    if (!currentUser) throw new UnauthorizedException('Invalid access token');
    if (currentUser.role.name === RoleName.SUPER_ADMIN) throw new BadRequestException('Platform admins do not require tenant onboarding');
    if (currentUser.onboardingCompleted && currentUser.tenantId) {
      return this.issueTokens(currentUser, ipAddress, userAgent);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await this.createTenantWorkspace(tx, dto);
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          tenantId: tenant.id,
          onboardingCompleted: true,
        },
        include: { role: true },
      });
      return { user };
    });

    return this.issueTokens(result.user, ipAddress, userAgent);
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
    if (!user) return { success: true, delivery: 'suppressed' as const };

    const token = await this.createPasswordResetToken(this.prisma, user.id);
    return this.tokenDelivery(token);
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

  async verifyEmail(token: string) {
    const tokenHash = await hashToken(token);
    const verificationToken = await this.prisma.emailVerificationToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!verificationToken) throw new BadRequestException('Invalid verification token');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { success: true };
  }

  async resendVerification(userId: string): Promise<TokenDelivery> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Invalid access token');
    if (user.emailVerifiedAt) return { success: true, delivery: 'suppressed' };

    const token = await this.createEmailVerificationToken(this.prisma, user.id);
    return this.tokenDelivery(token);
  }

  async sessions(userId: string) {
    const sessions = await this.prisma.refreshToken.findMany({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true,
      },
    });

    return sessions.map((session) => ({
      ...session,
      active: !session.revokedAt,
    }));
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { id: sessionId, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  private async issueTokens(user: AuthUser, ipAddress?: string, userAgent?: string) {
    const payload = {
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      onboardingCompleted: user.onboardingCompleted,
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
        emailVerified: Boolean(user.emailVerifiedAt),
        onboardingCompleted: user.onboardingCompleted,
        role: user.role.name,
        scope: user.role.scope,
      },
    };
  }

  private async verifyGoogleIdToken(idToken: string) {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID', '').trim();
    if (!clientId) throw new BadRequestException('Google authentication is not configured');

    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) throw new UnauthorizedException('Invalid Google token');

    return {
      subject: payload.sub,
      email: payload.email.toLowerCase(),
      emailVerified: payload.email_verified === true,
      name: payload.name || payload.email.split('@')[0],
    };
  }

  private async createPasswordResetToken(tx: Prisma.TransactionClient | PrismaService, userId: string) {
    const token = randomBytes(32).toString('hex');
    await tx.passwordResetToken.create({
      data: {
        userId,
        tokenHash: await hashToken(token),
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      },
    });
    return token;
  }

  private async createEmailVerificationToken(tx: Prisma.TransactionClient | PrismaService, userId: string) {
    const token = randomBytes(32).toString('hex');
    await tx.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: await hashToken(token),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
    return token;
  }

  private tokenDelivery(token: string): TokenDelivery {
    if (this.config.get<string>('AUTH_TOKEN_RESPONSE_ENABLED', 'false') === 'true') {
      return { success: true, delivery: 'console', token };
    }
    return { success: true, delivery: 'email' };
  }

  private async createTenantWorkspace(tx: Prisma.TransactionClient, dto: CompleteOnboardingDto) {
    const existingTenant = await tx.tenant.findUnique({ where: { slug: dto.slug } });
    if (existingTenant) throw new BadRequestException('Tenant slug is already used');

    const rootDomain = this.config.get<string>('ROOT_DOMAIN', 'localhost');
    const template = await this.findOrCreateTemplate(tx, dto.businessType);
    const tenant = await tx.tenant.create({
      data: { name: dto.businessName, slug: dto.slug, status: TenantStatus.TRIAL },
    });
    await tx.subscription.create({
      data: {
        tenantId: tenant.id,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.TRIALING,
        monthlyPrice: new Prisma.Decimal(0),
      },
    });
    const colorPreset = this.resolveColorPreset(dto.colorPreset);
    const theme = await tx.theme.create({
      data: {
        tenantId: tenant.id,
        name: dto.themePreference?.trim() || 'Default Theme',
        primaryColor: colorPreset.primaryColor,
        secondaryColor: colorPreset.secondaryColor,
        accentColor: colorPreset.accentColor,
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

    return tenant;
  }

  private resolveColorPreset(colorPreset?: string) {
    const presets: Record<string, { primaryColor: string; secondaryColor: string; accentColor: string }> = {
      teal: { primaryColor: '#0f766e', secondaryColor: '#f59e0b', accentColor: '#2563eb' },
      blue: { primaryColor: '#2563eb', secondaryColor: '#14b8a6', accentColor: '#f97316' },
      rose: { primaryColor: '#be123c', secondaryColor: '#0f766e', accentColor: '#f59e0b' },
    };
    return presets[colorPreset ?? 'teal'] ?? presets.teal;
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
