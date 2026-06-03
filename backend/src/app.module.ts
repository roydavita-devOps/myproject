import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { CommonModule } from './common/common.module';
import { MenusModule } from './modules/menus/menus.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { WebsitesModule } from './modules/websites/websites.module';
import { PrismaModule } from './prisma/prisma.module';
import { TenantResolverMiddleware } from './common/middleware/tenant-resolver.middleware';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    CommonModule,
    PrismaModule,
    AuthModule,
    TenantsModule,
    WebsitesModule,
    MenusModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantResolverMiddleware).forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
