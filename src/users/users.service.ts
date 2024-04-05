/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable no-var */
import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User as UserM, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';
import { Role, RoleDocument } from 'src/roles/schema/Role.schema';
import { User } from 'src/decorate/customize';
import { USER_ROLE } from 'src/database/sample';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  //dùng để hash password thành dạng nhìn vào sẽ không đọc đc password
  //sử dụng thu biện bcryptjs để hashpassword
  getHashPassword = (password: string) => {
    var salt = genSaltSync(10);
    var hash = hashSync(password, salt);
    return hash;
  };
  //check password sử dụng thư viện bcyptjs
  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async create(createUserDto: CreateUserDto, @User() user: IUser) {
    const { name, email, password, age, address, gender, role, company } =
      createUserDto;
    //logic check email
    const isExit = await this.userModel.findOne({ email: email });
    if (isExit) {
      throw new BadRequestException(
        `Email: ${email} đã tồn tại trên hệ thống vui lòng tạo email khác`,
      );
    }
    //fetch user role
    const userRole = await this.userModel.findOne({ name: USER_ROLE });
    const hashPassword = this.getHashPassword(password);
    //thêm mới
    let newuser = await this.userModel.create({
      email,
      password: hashPassword,
      name,
      age,
      gender,
      address,
      company,
      role: userRole?._id,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return newuser;
  }

  //tìm kiếm theo id
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'id not found';
    return await this.userModel
      .findOne({
        _id: id,
      })
      .select('-password')
      //lấy ra
      .populate({ path: 'role', select: { name: 1, id: 1 } });
  }

  //tim kiem theo email
  async findOneByUsername(username: string) {
    let userId = await this.userModel
      .findOne({
        email: username,
      })
      .populate({ path: 'role', select: { name: 1 } });
    return userId;
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    let update = await this.userModel.updateOne(
      {
        _id: updateUserDto._id,
      },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return update;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'id not found';
    }
    const foundUser = await this.userModel.findById(id);
    if (foundUser && foundUser.email === 'admin@gmail.com') {
      throw new BadRequestException('không thể xóa email admin@gmail.com');
    }
    await this.userModel.updateOne(
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
    return this.userModel.softDelete({ _id: id });
  }
  //register
  async register(user: RegisterUserDto) {
    const { name, email, password, age, gender, address } = user;
    //logic check email
    const isExit = await this.userModel.findOne({ email: email });
    if (isExit) {
      throw new BadRequestException(
        `Email: ${email} đã tồn tại trên hệ thống vui lòng tạo email khác`,
      );
    }
    //hash password về dạng mới mà phía client nhìn vào không biết được
    const hashPassword = this.getHashPassword(password);
    let newRegister = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      role: 'USER',
    });
    return newRegister;
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
    const totalItems = (await this.userModel.find(filter)).length;
    //tính tổng số trang
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore: Unreachable code error
      .sort(sort as any)
      .select('-password')
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

  //cập nhật user token
  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne({ _id }, { refreshToken });
  };
  //tìm kiếm user theo token
  findUserByToken = async (refreshToken: string) => {
    return await this.userModel
      .findOne({ refreshToken })
      .populate({ path: 'role', select: { name: 1 } });
  };
}
