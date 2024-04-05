/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Resume, ResumeDocument } from './schema/resume.schema';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserCvDto } from './dto/create-resume.dto';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

/* eslint-disable prettier/prettier */
@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private ResumeModel: SoftDeleteModel<ResumeDocument>,
  ) {}

  async create(createUserCvDto: CreateUserCvDto, user: IUser) {
    const { url, companyId, jobId } = createUserCvDto;
    const { email, _id } = user;
    //tạo mới resume
    const newCv = await this.ResumeModel.create({
      url,
      companyId,
      email,
      jobId,
      userId: _id,
      status: 'PENDING',
      createdBy: { _id, email },
      history: [
        {
          status: 'PENDING',
          updatedAt: new Date(),
          updatedBy: { _id: user._id, email: user.email },
        },
      ],
    });
    return {
      _id: newCv?._id,
      email: newCv?.email,
    };
  }
  async findOne(id: string) {
    return await this.ResumeModel.findOne({ id });
  }
  //lấy ra tất cả cv của user
  async findByUsers(user: IUser) {
    return await this.ResumeModel.find({
      userId: user._id,
    })
      //lấy ra CV gần nhấy
      .sort('-createdAt')
      .populate([
        { path: 'companyId', select: { name: 1 } },
        { path: 'jobId', select: { name: 1 } },
      ]);
  }
  async updateStatus(id: string, status: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found remuse id');
    }
    const update = await this.ResumeModel.updateOne(
      { _id: id },
      {
        status,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
        // $push để đẩy thêm data vào
        $push: {
          history: {
            status: status,
            updatedAt: new Date(),
            updatedBy: {
              _id: user._id,
              email: user.email,
            },
          },
        },
      },
    );
    return update;
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
    const totalItems = (await this.ResumeModel.find(filter)).length;
    //tính tổng số trang
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.ResumeModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: Unreachable code error
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
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
  //delete remuse
  async remove(id: string, user: IUser) {
    await this.ResumeModel.updateOne(
      { _id: id },
      //vì softDelete không hỗ trợ cập nhật phần này nên phải tách ra
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return await this.ResumeModel.softDelete({
      _id: id,
    });
  }
}
