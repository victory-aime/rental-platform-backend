import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsNumber,
  isUUID,
} from 'class-validator';
import { MaintenanceStatus, MaintenanceType } from '@prisma/client';

export class CreateMaintenanceDto {
  @IsUUID()
  carId: string;

  @IsUUID()
  @IsOptional()
  agencyId?: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MaintenanceType)
  @IsOptional()
  type?: MaintenanceType = MaintenanceType.PREVENTIVE;

  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus = MaintenanceStatus.PLANNED;

  @IsDateString()
  scheduledStartDate: string;

  @IsDateString()
  scheduledEndDate: string;

  @IsNumber()
  @IsOptional()
  cost?: number;
}

export class FilterMaintenanceDto {
  @IsUUID()
  @IsOptional()
  carId?: string;

  @IsUUID()
  @IsOptional()
  agencyId?: string;

  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @IsEnum(MaintenanceType)
  @IsOptional()
  type?: MaintenanceType;

  @IsDateString()
  @IsOptional()
  scheduledStartDateFrom?: string;

  @IsDateString()
  @IsOptional()
  scheduledStartDateTo?: string;
}

export class UpdateMaintenanceDto extends CreateMaintenanceDto {
  @IsUUID()
  id: string
}
