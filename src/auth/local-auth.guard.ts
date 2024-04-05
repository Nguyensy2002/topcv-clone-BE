/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//để xác thực người dùng đăng nhập thành công hay chưa dựa vào passport-local
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
