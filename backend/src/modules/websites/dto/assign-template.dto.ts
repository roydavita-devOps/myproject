import { IsNotEmpty, IsString } from 'class-validator';

export class AssignTemplateDto {
  @IsString()
  @IsNotEmpty()
  templateKey: string;
}
