/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { Permission, PermissionDocument } from './schema/permission.schema';
import { CreatePermissonDto } from './dto/create-permisson.dto';
import { UpdatePermissionDto } from './dto/update-permisson.dto';

/* eslint-disable prettier/prettier */
@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private PermissionModel: SoftDeleteModel<PermissionDocument>,
  ) {}
  async create(createPermissonDto: CreatePermissonDto, user: IUser) {
    const { name, apiPath, method, module } = createPermissonDto;
    const isExits = await this.PermissionModel.findOne({ apiPath, method });
    if (isExits) {
      throw new BadRequestException(
        `permisson với apiPath=${apiPath} method=${method}`,
      );
    }
    const newPermission = await this.PermissionModel.create({
      name,
      apiPath,
      method,
      module,
      createdBy: {
        id: user._id,
        email: user.email,
      },
    });
    return {
      id: newPermission?.id,
      createdAt: newPermission?.createdAt,
    };
  }
  //update
  async update(id: string, updatePermission: UpdatePermissionDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found permission');
    }
    const { name, apiPath, module, method } = updatePermission;
    const updated = await this.PermissionModel.updateOne(
      { id: id },
      {
        method,
        name,
        module,
        apiPath,
        updatedBy: {
          id: user._id,
          email: user.email,
        },
      },
    );
    return updated;
  }
  //get id permission
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('id not found');
    }
    return this.PermissionModel.findById(id);
  }
  //delete permission id
  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'id not found';
    }
    await this.PermissionModel.updateOne(
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
    return this.PermissionModel.softDelete({ _id: id });
  }
  //pagination permission
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
    const totalItems = (await this.PermissionModel.find(filter)).length;
    //tính tổng số trang
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.PermissionModel.find(filter)
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
