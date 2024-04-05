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
import { PermissionsService } from './permissions.service';
import { CreatePermissonDto } from './dto/create-permisson.dto';
import { UpdatePermissionDto } from './dto/update-permisson.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('permissions')
@Controller('permissions')
export class PermissonsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  //create a new Permissions
  @Post()
  @ResponseMessage('created successfully')
  create(@Body() createPermissonDto: CreatePermissonDto, @User() user: IUser) {
    return this.permissionsService.create(createPermissonDto, user);
  }
  //update
  @Patch(':id')
  @ResponseMessage('updated successfully')
  update(
    @Param('id') id: string,
    @Body() updatePermission: UpdatePermissionDto,
    @User() user: IUser,
  ) {
    return this.permissionsService.update(id, updatePermission, user);
  }
  //get id permission
  @Get(':id')
  @ResponseMessage('get id successfully')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }
  //delete
  @Delete(':id')
  @ResponseMessage('delete successfully')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.permissionsService.remove(id, user);
  }
  //pagination
  @Get()
  @Public()
  @ResponseMessage('pagination permission')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.permissionsService.findAll(+currentPage, +limit, qs);
  }
}
