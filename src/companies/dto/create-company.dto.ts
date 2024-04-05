/* eslint-disable prettier/prettier */
import { IsNotEmpty } from 'class-validator';

//sử dụng thư viện class-transfomer và validator để thực hiện validate
export class CreateCompanyDto {
  @IsNotEmpty({
    message: 'name không được để trống',
  })
  name: string;
  @IsNotEmpty({
    message: 'address không được để trống',
  })
  address: string;

  @IsNotEmpty({
    message: 'decription không được để trống',
  })
  description: string;
  @IsNotEmpty({
    message: 'logo không được để trống',
  })
  logo: string;
}
