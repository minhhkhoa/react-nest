import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import {
  Public,
  ResponseMessage,
  userDecorator,
} from 'src/decorator/customize';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Response } from 'express';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private roleService: RolesService,
  ) {}

  //-route nay se de public khong can xac thuc access_token voi JwtAuthGuard
  @Public()
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  // @Throttle(5, 60) //- co the ghi de nhu nay
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

  @Get('account')
  async getProfile(@userDecorator() user: IUser) {
    //- để any vì ở hàm findOne có trả về thêm trường permissions bằng populate, nhưng biến temp lại không biết có thêm permission vì bên logic của findOne đau có định nghĩa 
    const temp = await this.roleService.findOne(user.role._id) as any;
    user.permissions = temp.permissions;
    return { user };
  }

  //- xử lý refresh token khi access_token hết hạn gặp lỗi 401 ( 401 là lỗi ko truyền access_token hoặc access_token hết hạn )
  //-khi nhận code 401, client (frontend) sẽ TỰ ĐỘNG gọi API refresh_token, sử dụng token này để đổi lấy {access_token, refresh_token} mới.
  @Public() //- phải để public vì khi này access_token đâu còn hợp lệ
  @ResponseMessage('Get User by refresh token')
  @Get('refresh')
  async handleRefreshToken(
    @Req() request: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];

    return await this.authService.processNewToken(refreshToken, response);
  }

  @Post('logout')
  @ResponseMessage('Logout User')
  handleLogout(
    @Res({ passthrough: true }) response: Response,
    @userDecorator() user: IUser,
  ) {
    return this.authService.logout(response, user);
  }
}
