import { Allow, IsHexColor, IsOptional, IsString, Matches } from 'class-validator';

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

  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @IsOptional()
  @IsHexColor()
  accentColor?: string;

  @IsOptional()
  @IsString()
  premiumColorPreset?: string;

  @IsOptional()
  @Allow()
  heroMedia?: unknown;
}
