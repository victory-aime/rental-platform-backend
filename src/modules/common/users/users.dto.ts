import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class UpdateKeycloakUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUUID()
  keycloakId: string;

  @IsOptional()
  @IsBoolean()
  enabled2MFA?: boolean;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  picture?: string;

  @IsOptional()
  @IsString()
  newPassword?: string;
}
