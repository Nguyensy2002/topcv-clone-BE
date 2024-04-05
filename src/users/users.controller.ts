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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import mongoose from 'mongoose';
import { Public, ResponseMessage, User } from 'src/decorate/customize';
import { IUser } from './users.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  //thêm mới user
  @Post()
  @ResponseMessage('Create new User')
  async create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    // tương đương với email = req.body.createUserDto
    const newUser = await this.usersService.create(createUserDto, user);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  //lấy ra thông tin user
  @Public()
  @Get(':id')
  @ResponseMessage('fetch user by id')
  async findOne(@Param('id') id: string) {
    const foundUser = await this.usersService.findOne(id);
    return foundUser;
  }

  //cập nhật thông tin user
  @ResponseMessage('Update user')
  @Patch()
  async update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    const updateUsers = await this.usersService.update(updateUserDto, user);
    return updateUsers;
  }

  //xóa user
  @Delete(':id')
  @ResponseMessage('delete user')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }
  //panigation
  @Get()
  //gọi để trả message về phía client
  @ResponseMessage('fetch list user with paginate')
  findAll(
    @Query('current') currentPage: string, //const currentPage: string = req.query.page
    @Query('pageSize') limitPage: string,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+currentPage, +limitPage, qs);
  }
}
