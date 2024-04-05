/* eslint-disable prettier/prettier */
import { IsArray, IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

//sử dụng thư viện class-transfomer và validator để thực hiện validate
export class CreateRoleDto {
  @IsNotEmpty({ message: 'name không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'description không được để trống' })
  description: string;

  @IsNotEmpty({ message: 'isActive không được để trống' })
  isActive: boolean;

  @IsNotEmpty({ message: 'Roles không được để trống' })
  @IsArray({ message: 'Role có định dạng là array' })
  @IsMongoId({
    each: true,
    message: 'Role có định dạng là mongo object id',
  })
  permissions: mongoose.Schema.Types.ObjectId[];
}
