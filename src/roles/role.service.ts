/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { Role, RoleDocument } from './schema/Role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role';
import { ADMIN_ROLE } from 'src/database/sample';

/* eslint-disable prettier/prettier */
@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private RoleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  //create role
  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const { permissions, description, isActive, name } = createRoleDto;
    const isExits = await this.RoleModel.findOne({ name });
    if (isExits) {
      throw new BadRequestException(`Role với name = "${name}" đã tồn tại`);
    }
    const result = await this.RoleModel.create({
      name,
      description,
      isActive,
      permissions,
      createdBy: {
        id: user._id,
        email: user.email,
      },
    });
    return result;
  }
  //get id role
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('role not found');
    }
    return await this.RoleModel.findById(id).populate({
      path: 'permissions',
      select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 },
    });
  }
  //update id role
  async update(id: string, updateRole: UpdateRoleDto, user: IUser) {
    const { name, description, isActive, permissions } = updateRole;
    // const isExits = await this.RoleModel.findOne({ name });
    // if (isExits) {
    //   throw new BadRequestException(`Role với name = "${name}" đã tồn tại`);
    // }
    const newRole = await this.RoleModel.updateOne(
      { id: id },
      {
        name,
        description,
        isActive,
        permissions,
        createdBy: {
          id: user._id,
          email: user.email,
        },
      },
    );
    return newRole;
  }
  //delete id role
  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'id not found';
    }
    const foundRole = await this.RoleModel.findById(id);
    if (foundRole.name === ADMIN_ROLE) {
      throw new BadRequestException('không thể xóa role ADMIN');
    }
    await this.RoleModel.updateOne(
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
    return this.RoleModel.softDelete({ _id: id });
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
    const totalItems = (await this.RoleModel.find(filter)).length;
    //tính tổng số trang
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.RoleModel.find(filter)
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
