import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [MenusController],
  providers: [MenusService],
})
export class MenusModule {}
