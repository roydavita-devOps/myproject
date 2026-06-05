import { BusinessType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CompleteOnboardingDto {
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug: string;

  @IsEnum(BusinessType)
  businessType: BusinessType;

  @IsOptional()
  @IsString()
  templateName?: string;

  @IsOptional()
  @IsString()
  themePreference?: string;

  @IsOptional()
  @IsString()
  colorPreset?: string;
}
