/* eslint-disable prettier/prettier */
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import mongoose from 'mongoose';

//sử dụng thư viện class-transfomer và validator để thực hiện validate

export class CreateSubscriberDto {
  @IsNotEmpty({
    message: 'name không được để trống',
  })
  name: string;
  @IsEmail(
    {},
    {
      message: 'email không đúng định dạng',
    },
  )
  @IsNotEmpty({
    message: 'email không được để trống',
  })
  email: string;
  @IsNotEmpty({
    message: 'skill không được để trống',
  })
  @IsArray({ message: 'skill có định dạng là array ' })
  @IsString({ each: true, message: 'skill định dạng là string ' })
  skill: string[];
}
