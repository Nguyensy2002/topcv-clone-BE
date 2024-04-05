/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/users.interface';
import { ResponseMessage, User } from 'src/decorate/customize';
import { Subscriber, SubscriberDocument } from './schema/Subscriber.schema';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { CreateSubscriberDto } from './dto/create-subscribers.dto';
import { UpdateSubscriberDto } from './dto/update-subscribers.dto';

/* eslint-disable prettier/prettier */
@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name)
    private SubscriberModel: SoftDeleteModel<SubscriberDocument>,
  ) {}
  async create(createSubscriberDto: CreateSubscriberDto, @User() user: IUser) {
    const { email, name, skill } = createSubscriberDto;
    const newSub = await this.SubscriberModel.create({
      name,
      email,
      skill,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      _id: newSub?._id,
      createAt: newSub?.createdAt,
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
    const totalItems = (await this.SubscriberModel.find(filter)).length;
    //tính tổng số trang
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.SubscriberModel.find(filter)
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
    return await this.SubscriberModel.findById(id);
  }
  //update job
  async update(updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
    const updated = await this.SubscriberModel.updateOne(
      { email: user.email },
      {
        ...updateSubscriberDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
      { upsert: true },
    );
    return updated;
  }
  //delete a job
  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'id not found';
    }
    await this.SubscriberModel.updateOne(
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
    return this.SubscriberModel.softDelete({ _id: id });
  }
  async getSkills(user: IUser) {
    const { email } = user;
    return await this.SubscriberModel.findOne({ email }, { skills: 1 });
  }
}
