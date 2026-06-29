import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantContext as TenantContextDecorator } from '../../common/decorators/tenant-context.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantContext } from '../../common/types/tenant-context.type';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantsService } from './tenants.service';

@Controller('tenants')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(RoleName.SUPER_ADMIN)
export class TenantsController {
  constructor(private readonly tenants: TenantsService) {}

  @Get('me')
  @Roles(RoleName.TENANT_ADMIN, RoleName.EDITOR)
  findCurrent(@TenantContextDecorator() tenant: TenantContext) {
    return this.tenants.findOne(tenant.tenantId);
  }

  @Put('me')
  @Roles(RoleName.TENANT_ADMIN)
  updateCurrent(@TenantContextDecorator() tenant: TenantContext, @Body() dto: UpdateTenantDto) {
    return this.tenants.updateOwnTenant(tenant.tenantId, dto);
  }

  @Get()
  findAll() {
    return this.tenants.findAll();
  }

  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenants.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenants.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenants.update(id, dto);
  }

  @Patch(':id/suspend')
  suspend(@Param('id') id: string) {
    return this.tenants.suspend(id);
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.tenants.activate(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenants.softDelete(id);
  }
}
