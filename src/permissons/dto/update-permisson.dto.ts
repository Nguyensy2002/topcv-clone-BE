/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreatePermissonDto } from './create-permisson.dto';

export class UpdatePermissionDto extends PartialType(CreatePermissonDto) {}
