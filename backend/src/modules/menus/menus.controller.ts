import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantContext as TenantContextDecorator } from '../../common/decorators/tenant-context.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantContext } from '../../common/types/tenant-context.type';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { CreateMenuDto } from './dto/create-menu.dto';
import { ReorderMenuDto } from './dto/reorder-menu.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenusService } from './menus.service';

@Controller()
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(RoleName.TENANT_ADMIN, RoleName.EDITOR)
export class MenusController {
  constructor(private readonly menus: MenusService) {}

  @Get('menu-categories')
  findCategories(@TenantContextDecorator() tenant: TenantContext, @Query('websiteId') websiteId?: string) {
    return this.menus.findCategories(tenant.tenantId, websiteId);
  }

  @Post('menu-categories')
  createCategory(@TenantContextDecorator() tenant: TenantContext, @Body() dto: CreateMenuCategoryDto) {
    return this.menus.createCategory(tenant.tenantId, dto);
  }

  @Put('menu-categories/:id')
  updateCategory(
    @TenantContextDecorator() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: UpdateMenuCategoryDto,
  ) {
    return this.menus.updateCategory(tenant.tenantId, id, dto);
  }

  @Delete('menu-categories/:id')
  @Roles(RoleName.TENANT_ADMIN)
  deleteCategory(@TenantContextDecorator() tenant: TenantContext, @Param('id') id: string) {
    return this.menus.deleteCategory(tenant.tenantId, id);
  }

  @Get('menus')
  findMenus(@TenantContextDecorator() tenant: TenantContext, @Query('websiteId') websiteId?: string) {
    return this.menus.findMenus(tenant.tenantId, websiteId);
  }

  @Post('menus')
  createMenu(@TenantContextDecorator() tenant: TenantContext, @Body() dto: CreateMenuDto) {
    return this.menus.createMenu(tenant.tenantId, dto);
  }

  @Put('menus/:id')
  updateMenu(@TenantContextDecorator() tenant: TenantContext, @Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menus.updateMenu(tenant.tenantId, id, dto);
  }

  @Patch('menus/reorder')
  reorderMenus(@TenantContextDecorator() tenant: TenantContext, @Body() dto: ReorderMenuDto) {
    return this.menus.reorderMenus(tenant.tenantId, dto);
  }

  @Delete('menus/:id')
  @Roles(RoleName.TENANT_ADMIN)
  deleteMenu(@TenantContextDecorator() tenant: TenantContext, @Param('id') id: string) {
    return this.menus.deleteMenu(tenant.tenantId, id);
  }
}
