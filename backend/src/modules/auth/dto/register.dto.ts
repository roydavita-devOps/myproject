import { BusinessType } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug: string;

  @IsString()
  @IsNotEmpty()
  adminName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(10)
  password: string;

  @IsEnum(BusinessType)
  businessType: BusinessType;
}
