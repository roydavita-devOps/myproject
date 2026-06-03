import { IsOptional, IsString, Matches } from 'class-validator';

const assetUrlPattern = /^(\/api\/v1\/uploads\/|https?:\/\/).+/;

export class UpdateThemeAssetsDto {
  @IsOptional()
  @IsString()
  @Matches(assetUrlPattern, { message: 'logoUrl must be an uploaded asset or absolute URL' })
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @Matches(assetUrlPattern, { message: 'heroImageUrl must be an uploaded asset or absolute URL' })
  heroImageUrl?: string;
}
