import { IsOptional, IsString, Matches } from 'class-validator';

const assetUrlPattern = /^(\/api\/v1\/uploads\/|https?:\/\/).+/;

export class AddGalleryItemDto {
  @IsString()
  @Matches(assetUrlPattern, { message: 'imageUrl must be an uploaded asset or absolute URL' })
  imageUrl!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  altText?: string;
}
