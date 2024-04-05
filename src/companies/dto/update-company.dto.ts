/* eslint-disable prettier/prettier */
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto';

export class UpdateCompanyDto extends OmitType(CreateCompanyDto, [] as const) {
  name: string;
  address: string;
  description: string;
}
