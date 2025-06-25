import { Car } from '@prisma/client';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class ParcDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsArray()
  listCar: Car[];
}

export class ParcQueryDto {
  @IsString()
  name?: string;

  @IsNumber()
  carsNumber?: number;

  @IsNumber()
  page?: number;

  @IsNumber()
  limit?: number;
}
