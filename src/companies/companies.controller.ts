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
import { CreateCompanyDto } from './dto/create-Company.dto';
import { CompaniesService } from './companies.service';
import { IUser } from 'src/users/users.interface';
import { Public, ResponseMessage, User } from 'src/decorate/customize';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('companies')
@Controller('Companies')
export class CompaniesController {
  constructor(private readonly CompanysService: CompaniesService) {}

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto, @User() user: IUser) {
    // tương đương với email = req.body.createCompanyDto
    return this.CompanysService.create(createCompanyDto, user);
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
    return this.CompanysService.findAll(+currentPage, +limitPage, qs);
  }

  //update
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @User() user: IUser,
  ) {
    return this.CompanysService.update(id, updateCompanyDto, user);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.CompanysService.findOne(id);
  }

  //delete
  @Delete(':id')
  remove(@Param(':id') id: string, @User() user: IUser) {
    return this.CompanysService.remove(id, user);
  }
}
