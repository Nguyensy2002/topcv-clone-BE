/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateResumeDto } from './create-resume.dto';
import { IsArray, IsEmail, IsNotEmpty, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export class UpdatedBy {
  @IsNotEmpty()
  _id: Types.ObjectId;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class History {
  @IsNotEmpty()
  status: string;
  @IsNotEmpty()
  updatedAt: Date;
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => UpdatedBy)
  updatedBy: UpdatedBy;
}

export class UpdateRemuseDto extends PartialType(CreateResumeDto) {
  @IsNotEmpty({ message: 'history không được để trống' })
  @IsArray({ message: 'history có định dạng là array' })
  @ValidateNested()
  @Type(() => History)
  history: History;
}
