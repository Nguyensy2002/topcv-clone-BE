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
import { IUser } from 'src/users/users.interface';
import { Public, ResponseMessage, User } from 'src/decorate/customize';
import { CreateJobDto } from './dto/create-job.dto';
import { JobsService } from './jobs.service';
import { UpdateJobDto } from './dto/update-job.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ResponseMessage('Create new Jobs')
  async create(@Body() createJobDto: CreateJobDto, @User() user: IUser) {
    return await this.jobsService.create(createJobDto, user);
  }
  //phân trang job
  @Get()
  @Public()
  @ResponseMessage('pagination job')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.jobsService.findAll(+currentPage, +limit, qs);
  }
  //get job
  @Get(':id')
  @Public()
  @ResponseMessage('get jobs')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }
  //update job
  @Patch(':id')
  @ResponseMessage('update job')
  update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @User() user: IUser,
  ) {
    this.jobsService.update(id, updateJobDto, user);
  }
  //delete job
  @Delete(':id')
  @ResponseMessage('delete job')
  remove(@Param('id') id: string, @User() user: IUser) {
    this.jobsService.remove(id, user);
  }
}
