/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { IUser } from 'src/users/users.interface';
import { Public, ResponseMessage, User } from 'src/decorate/customize';
import { RolesService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly RolesService: RolesService) {}
  //create a new role
  @Post()
  @ResponseMessage('create new successfully')
  create(@Body() createRoleDto: CreateRoleDto, @User() user: IUser) {
    return this.RolesService.create(createRoleDto, user);
  }
  //get id permissions
  @Get(':id')
  @ResponseMessage('get id role')
  findOne(@Param('id') id: string) {
    return this.RolesService.findOne(id);
  }
  //update role
  @Patch(':id')
  @ResponseMessage('update role id')
  update(
    @Param('id') updateRole: UpdateRoleDto,
    id: string,
    @User() user: IUser,
  ) {
    return this.RolesService.update(id, updateRole, user);
  }
  @Delete(':id')
  @ResponseMessage('delete role id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.RolesService.remove(id, user);
  }
  //pagination role
  @Get()
  @Public()
  @ResponseMessage('pagination permission')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.RolesService.findAll(+currentPage, +limit, qs);
  }
}
