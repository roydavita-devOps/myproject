import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { HealthService } from './health.service';

@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  healthCheck() {
    return this.health.check();
  }

  @Get('live')
  live() {
    return this.health.live();
  }

  @Get('ready')
  ready() {
    return this.health.ready();
  }

  @Get('database')
  database() {
    return this.health.database();
  }

  @Get('storage')
  storage() {
    return this.health.storage();
  }

  @Get('cache')
  cache() {
    return this.health.cache();
  }
}
