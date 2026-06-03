import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { TenantGuard } from './guards/tenant.guard';
import { TenantResolverMiddleware } from './middleware/tenant-resolver.middleware';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [JwtAuthGuard, RolesGuard, TenantGuard, TenantResolverMiddleware],
  exports: [JwtModule, JwtAuthGuard, RolesGuard, TenantGuard, TenantResolverMiddleware],
})
export class CommonModule {}
