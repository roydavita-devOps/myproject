import { Module } from '@nestjs/common';
import { UploadsModule } from '../uploads/uploads.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [PrismaModule, UploadsModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
