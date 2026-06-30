import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UploadsModule } from '../uploads/uploads.module';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';

@Module({
  imports: [JwtModule.register({}), UploadsModule],
  controllers: [MenusController],
  providers: [MenusService],
})
export class MenusModule {}
