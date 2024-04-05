/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable prettier/prettier */
/* eslint-disable no-var */
import { BadRequestException, Injectable } from '@nestjs/common';
import { Company, CompanyDocument } from './schemas/Company.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCompanyDto } from './dto/create-Company.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import { UpdateCompanyDto } from './dto/update-company.dto';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel<CompanyDocument>,
  ) {}
  create(createCompanyDto: CreateCompanyDto, user: IUser) {
    return this.companyModel.create({
      ...createCompanyDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
  }
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found company id');
    }
    await this.companyModel.findOne({ id });
  }
  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    return await this.companyModel.updateOne(
      { _id: id },
      {
        ...updateCompanyDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
  }
  async remove(id: string, user: IUser) {
    await this.companyModel.updateOne(
      { _id: id },
      //vì softDelete không hỗ trợ cập nhật phần này nên phải tách ra
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return await this.companyModel.softDelete({
      _id: id,
    });
  }
  //query chưc năng panigation
  //sử dụng thư viện aqp from 'api-query-params'
  async findAll(currentPage: number, limitPage: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    //logic phân trang
    let offset = (+currentPage - 1) * +limitPage;
    let defaultLimit = +limitPage ? +limitPage : 10;
    //tính tổng số bản ghi
    const totalItems = (await this.companyModel.find(filter)).length;
    //tính tổng số trang
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.companyModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: Unreachable code error
      .sort(sort as any)
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limitPage, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }
}
