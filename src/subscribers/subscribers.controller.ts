/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SubscribersService } from 'src/subscribers/subscribers.service';
import { IUser } from 'src/users/users.interface';
import {
  Public,
  ResponseMessage,
  SkipCheckPermission,
  User,
} from 'src/decorate/customize';
import { CreateSubscriberDto } from './dto/create-subscribers.dto';
import { UpdateSubscriberDto } from './dto/update-subscribers.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('subscribers')
@Controller('Subscribers')
export class SubscribersController {
  constructor(private readonly SubscribersService: SubscribersService) {}
  //create a new Subscribers
  @Post()
  @ResponseMessage('Create new subscribers')
  async create(
    @Body() createSubscriberDto: CreateSubscriberDto,
    @User() user: IUser,
  ) {
    return await this.SubscribersService.create(createSubscriberDto, user);
  }
  //
  @Post('skills')
  @ResponseMessage("get subriber's skills")
  @SkipCheckPermission()
  getUserSkills(@User() user: IUser) {
    return this.SubscribersService.getSkills(user);
  }
  //phân trang subscribers
  @Get()
  @Public()
  @ResponseMessage('pagination permission')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.SubscribersService.findAll(+currentPage, +limit, qs);
  }
  //get permission
  @Get(':id')
  @Public()
  @ResponseMessage('get permissions')
  findOne(@Param('id') id: string) {
    return this.SubscribersService.findOne(id);
  }
  //update permission
  @Patch()
  @SkipCheckPermission()
  @ResponseMessage('update permission')
  update(
    @Param('id') id: string,
    @Body() updateSubscriberDto: UpdateSubscriberDto,
    @User() user: IUser,
  ) {
    this.SubscribersService.update(updateSubscriberDto, user);
  }
  //delete permission
  @Delete(':id')
  @ResponseMessage('delete permission')
  remove(@Param('id') id: string, @User() user: IUser) {
    this.SubscribersService.remove(id, user);
  }
}
