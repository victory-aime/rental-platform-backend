import { DiscountType, VehicleStatus } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsUUID,
  IsBoolean,
} from 'class-validator';

export class CreateCarDto {
  @IsUUID()
  agencyId: string;

  @IsUUID()
  id?: string;

  @IsString()
  agencyName?: string;

  @IsString()
  name: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsString()
  plateNumber: string;

  @IsNumber()
  dailyPrice: number;

  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @IsOptional()
  @IsNumber()
  discountValue?: number;

  @IsOptional()
  @IsString()
  rentalPriceDiscounted?: number;

  @IsOptional()
  @IsString()
  transmission?: string;

  @IsOptional()
  @IsString()
  fuelType?: string;

  @IsNumber()
  doors?: number;

  @IsNumber()
  seats?: number;

  @IsOptional()
  @IsUUID()
  carCategoryId?: string;

  @IsString()
  @IsArray()
  carImages: string[];

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsEnum(VehicleStatus)
  satuts?: VehicleStatus;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  equipmentIds?: string[];
}
