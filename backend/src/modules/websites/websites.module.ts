import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UploadsModule } from '../uploads/uploads.module';
import { WebsitesController } from './websites.controller';
import { WebsitesService } from './websites.service';

@Module({
  imports: [JwtModule.register({}), UploadsModule],
  controllers: [WebsitesController],
  providers: [WebsitesService],
  exports: [WebsitesService],
})
export class WebsitesModule {}
