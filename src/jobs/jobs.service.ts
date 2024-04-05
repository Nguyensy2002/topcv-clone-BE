/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/users.interface';
import { ResponseMessage, User } from 'src/decorate/customize';
import { Job, JobDocument } from './schema/job.schema';
import { UpdateJobDto } from './dto/update-job.dto';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { CreateJobDto } from './dto/create-job.dto';

/* eslint-disable prettier/prettier */
@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private JobModel: SoftDeleteModel<JobDocument>,
  ) {}

  async create(createJobDto: CreateJobDto, @User() user: IUser) {
    const {
      company,
      description,
      level,
      location,
      name,
      quantity,
      salary,
      skill,
      startDate,
      endDate,
      isActive,
    } = createJobDto;
    const newJob = await this.JobModel.create({
      company,
      description,
      level,
      location,
      name,
      quantity,
      salary,
      skill,
      startDate,
      endDate,
      isActive,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      _id: newJob?._id,
      createAt: newJob?.createdAt,
    };
  }
  //pagination
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
    const totalItems = (await this.JobModel.find(filter)).length;
    //tính tổng số trang
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.JobModel.find(filter)
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
  // get job
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return `not found job`;
    }
    return await this.JobModel.findById(id);
  }
  //update job
  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    const updated = await this.JobModel.updateOne(
      { _id: id },
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return updated;
  }
  //delete a job
  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'id not found';
    }
    await this.JobModel.updateOne(
      {
        _id: id,
      },
      {
        deletedBy: {
          _id: user._id,
          name: user.name,
        },
      },
    );
    return this.JobModel.softDelete({ _id: id });
  }
}
