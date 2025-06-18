import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  Public,
  ResponseMessage,
  userDecorator,
} from 'src/decorator/customize';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Response } from 'express';
import { IUser } from 'src/users/users.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //-route nay se de public khong can xac thuc access_token voi JwtAuthGuard
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ResponseMessage('User login')
  handleLogin(@Req() req: any, @Res({ passthrough: true }) response: Response) {
    //- req.user được passport tự động trả về khi xác thực thành công người dùng ở hàm validate của file Strategy, nó sẽ lấy giá trị trả về của hàm validate dán vào req.user
    return this.authService.login(req.user, response);
  }

  @Public()
  @ResponseMessage('Register a new user')
  @Post('register')
  handleRegister(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('account')
  getProfile(@userDecorator() user: IUser) {
    return { user };
  }
}
