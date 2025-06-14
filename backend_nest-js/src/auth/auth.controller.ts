import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from 'src/decorator/customize';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //-route nay se de public khong can xac thuc access_token voi JwtAuthGuard
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  handleLogin(@Request() req: any) {
    //- req.user được passport tự động trả về khi xác thực thành công người dùng ở hàm validate của file Strategy, nó sẽ lấy giá trị trả về của hàm validate dán vào req.user
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
