/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateSubscriberDto } from './create-subscribers.dto';

export class UpdateSubscriberDto extends PartialType(CreateSubscriberDto) {}
