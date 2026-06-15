import { Controller, Get, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TemplatesService } from './templates.service';

@Controller('templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.TENANT_ADMIN, RoleName.EDITOR)
export class TemplatesController {
  constructor(private readonly templates: TemplatesService) {}

  @Get()
  findAll() {
    return this.templates.findAll();
  }
}
