import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { RoleName } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantContext as TenantContextDecorator } from '../../common/decorators/tenant-context.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantContext } from '../../common/types/tenant-context.type';
import { AddGalleryItemDto } from './dto/add-gallery-item.dto';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { UpdateThemeAssetsDto } from './dto/update-theme-assets.dto';
import { UpdateWebsiteDto } from './dto/update-website.dto';
import { WebsitesService } from './websites.service';

@Controller()
export class WebsitesController {
  constructor(private readonly websites: WebsitesService) {}

  @Get('websites')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(RoleName.TENANT_ADMIN, RoleName.EDITOR)
  findAll(@TenantContextDecorator() tenant: TenantContext) {
    return this.websites.findAll(tenant.tenantId);
  }

  @Post('websites')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(RoleName.TENANT_ADMIN)
  create(@TenantContextDecorator() tenant: TenantContext, @Body() dto: CreateWebsiteDto) {
    return this.websites.create(tenant.tenantId, dto);
  }

  @Get('websites/:id')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(RoleName.TENANT_ADMIN, RoleName.EDITOR)
  findOne(@TenantContextDecorator() tenant: TenantContext, @Param('id') id: string) {
    return this.websites.findOne(tenant.tenantId, id);
  }

  @Put('websites/:id')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(RoleName.TENANT_ADMIN, RoleName.EDITOR)
  update(@TenantContextDecorator() tenant: TenantContext, @Param('id') id: string, @Body() dto: UpdateWebsiteDto) {
    return this.websites.update(tenant.tenantId, id, dto);
  }

  @Patch('websites/:id/theme-assets')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(RoleName.TENANT_ADMIN, RoleName.EDITOR)
  updateThemeAssets(@TenantContextDecorator() tenant: TenantContext, @Param('id') id: string, @Body() dto: UpdateThemeAssetsDto) {
    return this.websites.updateThemeAssets(tenant.tenantId, id, dto);
  }

  @Post('websites/:id/gallery')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(RoleName.TENANT_ADMIN, RoleName.EDITOR)
  addGalleryItem(@TenantContextDecorator() tenant: TenantContext, @Param('id') id: string, @Body() dto: AddGalleryItemDto) {
    return this.websites.addGalleryItem(tenant.tenantId, id, dto);
  }

  @Patch('websites/:id/publish')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(RoleName.TENANT_ADMIN)
  publish(@TenantContextDecorator() tenant: TenantContext, @Param('id') id: string) {
    return this.websites.publish(tenant.tenantId, id);
  }

  @Patch('websites/:id/unpublish')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(RoleName.TENANT_ADMIN)
  unpublish(@TenantContextDecorator() tenant: TenantContext, @Param('id') id: string) {
    return this.websites.unpublish(tenant.tenantId, id);
  }

  @Get('websites/:id/preview')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(RoleName.TENANT_ADMIN, RoleName.EDITOR)
  preview(@TenantContextDecorator() tenant: TenantContext, @Param('id') id: string) {
    return this.websites.preview(tenant.tenantId, id);
  }

  @Delete('websites/:id')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(RoleName.TENANT_ADMIN)
  archive(@TenantContextDecorator() tenant: TenantContext, @Param('id') id: string) {
    return this.websites.archive(tenant.tenantId, id);
  }

  @Public()
  @Get('public/site')
  publicSite(@TenantContextDecorator() tenant?: TenantContext) {
    if (!tenant) throw new NotFoundException('Published site not found');
    return this.websites.publicSite(tenant.tenantId);
  }

  @Public()
  @Get('public/site/:slug')
  publicSiteBySlug(@Param('slug') slug: string) {
    return this.websites.publicSiteBySlug(slug);
  }
}
