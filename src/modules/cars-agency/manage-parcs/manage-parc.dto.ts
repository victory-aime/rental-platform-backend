import { Car } from '@prisma/client';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class ParcDto {
  @IsOptional()
  @IsString()
  agencyId?: string;

  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsArray()
  listCar: Car[];
}

export class ParcQueryDto {
  @IsString()
  agencyId?: string;

  @IsString()
  name?: string;

  @IsNumber()
  carsNumber?: number;

  @IsNumber()
  page?: number;

  @IsNumber()
  limit?: number;
}
