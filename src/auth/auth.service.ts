/* eslint-disable prettier/prettier */
/* eslint-disable prefer-const */
/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
import { RolesService } from 'src/roles/role.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private roleService: RolesService,
  ) {}
  //kiểm tra password và email
  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      const isValid = await this.usersService.isValidPassword(
        pass,
        user.password,
      );
      if (isValid === true) {
        const userRole = user.role as unknown as { _id: string; name: string };
        const temp = await this.roleService.findOne(userRole._id);
        const objUser = {
          ...user.toObject(),
          permissions: temp?.permissions ?? [],
        };
        return objUser;
      }
    }
    return null;
  }
  //sử dụng thư viện passport-jwt để khi đăng nhập thành công sẽ tạo ra access_token
  async login(user: IUser, response: Response) {
    const { _id, name, email, role, permissions } = user;
    const payload = {
      sub: 'token login', //nội dung token
      iss: 'from server', //người tạo token
      _id,
      name,
      email,
      role,
    };
    const refresh_token = this.createRefreshToken(payload);
    //update user with refresh token
    await this.usersService.updateUserToken(refresh_token, _id);
    //set refresh_token as cookies
    //sử dụng thư viện cookie parser
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
    });
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role,
        permissions,
      },
    };
  }
  //register
  async register(user: RegisterUserDto) {
    const newUser = await this.usersService.register(user);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  // tạo mới refresh token
  createRefreshToken = (payload: any) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')) / 1000,
    });
    return refresh_token;
  };
  //nếu access_token hết hạn thì gọi refresh_token rồi tạo lại access_token
  processNewToken = async (refreshToken: string, response: Response) => {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      let user = await this.usersService.findUserByToken(refreshToken);
      if (user) {
        const { _id, name, email, role } = user;
        const payload = {
          sub: 'token refresh',
          iss: 'from server',
          _id,
          name,
          email,
          role,
        };
        const refresh_token = this.createRefreshToken(payload);
        //update user with refresh token
        await this.usersService.updateUserToken(refresh_token, _id.toString());
        //fetch user role
        const userRole = user.role as unknown as { _id: string; name: string };
        const temp = await this.roleService.findOne(userRole._id);
        //xóa đi cookies cũ
        response.clearCookie('refresh_token');
        //set refresh_token as cookies
        response.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
        });
        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id,
            name,
            email,
            role,
            permissions: temp?.permissions ?? [],
          },
        };
      }
    } catch (error) {
      throw new BadRequestException(
        'refresh token không hợp lệ vui lòng login lại',
      );
    }
  };

  //Logout
  logout = async (response: Response, user: IUser) => {
    //cập nhật xét refresh_token bằng rỗng và lấy ra user id
    await this.usersService.updateUserToken('', user._id);
    //xóa cookie
    response.clearCookie('refresh_token');
    return 'Ok';
  };
}
