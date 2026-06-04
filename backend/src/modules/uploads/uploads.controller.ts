import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile as NestUploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { RoleName } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantContext as TenantContextDecorator } from '../../common/decorators/tenant-context.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantContext } from '../../common/types/tenant-context.type';
import { isUploadAssetType, UPLOAD_POLICIES } from './upload-policy';
import { UploadedFile } from './uploaded-file.type';
import { UploadsService } from './uploads.service';

const maxUploadSize = Math.max(...Object.values(UPLOAD_POLICIES).map((policy) => policy.maxSize));

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post(':assetType')
  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(RoleName.TENANT_ADMIN, RoleName.EDITOR)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: maxUploadSize, files: 1 },
    }),
  )
  upload(
    @TenantContextDecorator() tenant: TenantContext,
    @Param('assetType') assetType: string,
    @NestUploadedFile() file?: UploadedFile,
  ) {
    if (!isUploadAssetType(assetType)) throw new BadRequestException('Unsupported upload asset type');
    return this.uploads.store(tenant.tenantId, assetType, file);
  }

  @Public()
  @Get(':tenantId/:assetType/:fileName')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  async publicFile(
    @Param('tenantId') tenantId: string,
    @Param('assetType') assetType: string,
    @Param('fileName') fileName: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const file = await this.uploads.readPublicFile(tenantId, assetType, fileName);
    response.setHeader('Content-Type', file.contentType);
    return new StreamableFile(file.stream);
  }
}
