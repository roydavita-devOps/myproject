import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateWebsiteDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  businessName?: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  socialMedia?: Record<string, string>;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  mapsUrl?: string;

  @IsOptional()
  openingHours?: Record<string, unknown>;
}
