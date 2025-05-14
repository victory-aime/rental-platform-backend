import { DiscountType } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsUUID,
  IsHexColor,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class CreateCarDto {
  @IsUUID()
  agenceId: string;

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
  @IsNumber()
  weeklyPrice?: number;

  @IsOptional()
  @IsEnum(DiscountType)
  discountType?: DiscountType;

  @IsOptional()
  @IsNumber()
  discountValue?: number;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsString()
  transmission?: string;

  @IsOptional()
  @IsString()
  fuelType?: string;

  @IsOptional()
  @IsInt()
  doors?: number;

  @IsOptional()
  @IsInt()
  seats?: number;

  @IsOptional()
  @IsUUID()
  carCategoryId?: string;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  equipmentIds?: string[];
}
