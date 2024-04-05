/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Req,
  Post,
  Res,
  UseGuards,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorate/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { RegisterUserDto, UserLoginDto } from 'src/users/dto/create-user.dto';
import { Response, Request } from 'express';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/role.service';
import { Throttle, ThrottlerModule } from '@nestjs/throttler';
import { ApiTags, ApiBody } from '@nestjs/swagger';

//dùng ApiTags của thư viện swagger
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private roleService: RolesService,
  ) {}
  //dùng useGuards của thư viện passport để xử lý đăng nhập
  @Public()
  @ApiBody({ type: UserLoginDto })
  @UseGuards(LocalAuthGuard)
  // sử dụng thư viện throttler của nestjs khia báo ở app.module để hạn chế gọi api với số lần gọi được quy định
  @UseGuards(ThrottlerModule)
  @Throttle(2, 60)
  @ResponseMessage('user login')
  @Post('/login')
  //dùng response để gán cookie thông qua thư viện cookie-parser
  handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }
  @Public()
  @ResponseMessage('Register a new user')
  @Post('register')
  handleRegister(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }
  //get account
  @ResponseMessage('Get user information')
  @Get('/account')
  async handleGetAccount(@User() user: IUser) {
    const temp = (await this.roleService.findOne(user.role._id)) as any;
    user.permissions = temp.permissions;
    return { user };
  }
  //refresh_token
  @Public()
  @ResponseMessage('Get user by refresh token')
  @Get('/refresh')
  handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];
    return this.authService.processNewToken(refreshToken, response);
  }
  //logout
  @ResponseMessage('logout success')
  @Post('/logout')
  handleLogout(
    @Res({ passthrough: true }) response: Response,
    @User() user: IUser,
  ) {
    return this.authService.logout(response, user);
  }
}
