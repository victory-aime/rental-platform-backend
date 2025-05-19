import { CreateCarDto } from 'src/modules/cars-agency/manage-cars/manage-cars.dto';
import { convertToFloat, convertToInteger } from './convert';

export function normalizeCarDto(dto: CreateCarDto): CreateCarDto {
  const { agencyName, ...rest } = dto;
  return {
    ...rest,
    dailyPrice: dto.dailyPrice && convertToFloat(dto.dailyPrice?.toString()),
    discountValue: dto.discountValue
      ? convertToFloat(dto.discountValue.toString())
      : undefined,
    rentalPriceDiscounted: dto.rentalPriceDiscounted
      ? convertToFloat(dto.rentalPriceDiscounted.toString())
      : undefined,
    doors: dto.doors ? convertToInteger(dto.doors.toString()) : undefined,
    seats: dto.seats ? convertToInteger(dto.seats.toString()) : undefined,
  };
}
