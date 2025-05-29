import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Public } from './decorator/customize';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private configService: ConfigService,
    private authService: AuthService,
  ) {}

  @Get()
  getHello(): string {
    console.log('check PORT: ', this.configService.get<string>('PORT')); //- cu phap .get<string> la mong muon kieu tra ve la string
    return this.appService.getHello();
  }

  @Public() //-route nay se de public khong can xac thuc access_token voi JwtAuthGuard
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  handleLogin(@Request() req) {
    //- req.user được passport tự động trả về khi xác thực thành công người dùng ở hàm validate của  file Strategy, nó sẽ lấy giá trị trả về của hàm validate dán vào req.user
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
