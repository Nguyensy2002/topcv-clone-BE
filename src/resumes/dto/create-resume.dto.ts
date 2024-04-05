/* eslint-disable prettier/prettier */
import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

//sử dụng thư viện class-transfomer và validator để thực hiện validate
export class CreateResumeDto {
  @IsNotEmpty({ message: 'email không được để trống' })
  email: string;

  @IsNotEmpty({ message: 'userId không được để trống' })
  userId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'user không được để trống' })
  user: string;

  @IsNotEmpty({ message: 'status không được để trống' })
  status: string;

  @IsNotEmpty({
    message: 'companyId không được để trống',
  })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({
    message: 'jobId không được để trống',
  })
  jobId: mongoose.Schema.Types.ObjectId;
}

export class CreateUserCvDto {
  @IsNotEmpty({
    message: 'url không được để trống',
  })
  url: string;
  @IsNotEmpty({
    message: 'companyId không được để trống',
  })
  @IsMongoId({ message: 'companyId is a mongo id' })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({
    message: 'jobId không được để trống',
  })
  @IsMongoId({ message: 'companyId is a mongo id' })
  jobId: mongoose.Schema.Types.ObjectId;
}
