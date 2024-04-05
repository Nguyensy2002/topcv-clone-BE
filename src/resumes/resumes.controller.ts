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
import { ResumesService } from './resumes.service';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { IUser } from 'src/users/users.interface';
import { Public, ResponseMessage, User } from 'src/decorate/customize';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('resumes')
@Controller('resumes')
export class ResumesController {
  constructor(private readonly remusesService: ResumesService) {}
  //thêm remuse
  @Post()
  @ResponseMessage('create a new resume')
  Create(@Body() createUserCvDto: CreateUserCvDto, @User() user: IUser) {
    return this.remusesService.create(createUserCvDto, user);
  }
  //get id
  @Get(':id')
  @ResponseMessage('get remuse by user')
  getRemuseByUser(@User() user: IUser) {
    this.remusesService.findByUsers(user);
  }
  //lấy ra tất cả cv của user
  @Post('by-user')
  @ResponseMessage('get id remuse')
  findOne(@Param(':id') id: string) {
    this.remusesService.findOne(id);
  }
  //update
  @Patch(':id')
  @ResponseMessage('patch id remuse')
  updateStatus(
    @Body('status') status: string,
    @Param('id') id: string,
    @User() user: IUser,
  ) {
    return this.remusesService.updateStatus(status, id, user);
  }
  //panigation
  @Public()
  @Get()
  //gọi để trả message về phía client
  @ResponseMessage('fetch list company with paginate')
  findAll(
    @Query('current') currentPage: string, //const currentPage: string = req.query.page
    @Query('pageSize') limitPage: string,
    @Query() qs: string,
  ) {
    return this.remusesService.findAll(+currentPage, +limitPage, qs);
  }
  //delete
  @Delete(':id')
  @ResponseMessage('delete remuse id')
  remove(@Param(':id') id: string, @User() user: IUser) {
    return this.remusesService.remove(id, user);
  }
}
