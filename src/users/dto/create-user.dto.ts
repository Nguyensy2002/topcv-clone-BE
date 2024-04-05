import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsMongoId,
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
}
export class CreateUserDto {
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
    message: 'password không được để trống',
  })
  password: string;
  @IsNotEmpty({
    message: 'age không được để trống',
  })
  age: number;
  @IsNotEmpty({
    message: 'gender không được để trống',
  })
  gender: string;
  @IsNotEmpty({
    message: 'address không được để trống',
  })
  address: string;
  @IsNotEmpty({
    message: 'role không được để trống',
  })
  @IsMongoId({ message: 'role có định dạng là mongo id' })
  role: mongoose.Schema.Types.ObjectId;

  //company
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;
}

//register
export class RegisterUserDto {
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
    message: 'password không được để trống',
  })
  password: string;
  @IsNotEmpty({
    message: 'age không được để trống',
  })
  age: number;
  @IsNotEmpty({
    message: 'gender không được để trống',
  })
  gender: string;
  @IsNotEmpty({
    message: 'address không được để trống',
  })
  address: string;
}
//user login dto
export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'admin@gmail.com', description: 'username' })
  readonly username: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '123456',
    description: 'password',
  })
  readonly password: string;
}
