/* eslint-disable prettier/prettier */
import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

//sử dụng thư viện class-transfomer và validator để thực hiện validate
export class CreatePermissonDto {
  @IsNotEmpty({ message: 'name không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'userId không được để trống' })
  apiPath: string;

  @IsNotEmpty({ message: 'user không được để trống' })
  method: string;

  @IsNotEmpty({ message: 'status không được để trống' })
  module: string;
}
