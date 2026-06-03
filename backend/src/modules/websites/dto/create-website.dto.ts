import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateWebsiteDto {
  @IsUUID()
  templateId: string;

  @IsOptional()
  @IsUUID()
  themeId?: string;

  @IsString()
  @IsNotEmpty()
  businessName: string;
}
