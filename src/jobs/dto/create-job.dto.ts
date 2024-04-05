/* eslint-disable prettier/prettier */
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

//sử dụng thư viện class-transfomer và validator để thực hiện validate
class Company {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  logo: string;
}
export class CreateJobDto {
  @IsNotEmpty({
    message: 'name không được để trống',
  })
  name: string;

  @IsNotEmpty({
    message: 'skill không được để trống',
  })
  @IsArray({ message: 'skill có định dạng là array ' })
  @IsString({ each: true, message: 'skill định dạng là string ' })
  skill: string[];
  @IsNotEmpty({
    message: 'location không được để trống',
  })
  location: string;
  @IsNotEmpty({
    message: 'salary không được để trống',
  })
  salary: number;
  @IsNotEmpty({
    message: 'quantity không được để trống',
  })
  quantity: number;
  @IsNotEmpty({
    message: 'level không được để trống',
  })
  level: string;
  @IsNotEmpty({
    message: 'description không được để trống',
  })
  description: string;

  //company
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;

  @IsNotEmpty({
    message: 'startDate không được để trống',
  })
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @IsNotEmpty({
    message: 'endDate không được để trống',
  })
  @Transform(({ value }) => new Date(value))
  endDate: Date;

  @IsNotEmpty({
    message: 'isActive không được để trống',
  })
  @IsBoolean({ message: 'isActive có định dạng là boolean' })
  isActive: boolean;
}
