import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    //- @Body() === req.body
    return this.usersService.create(createUserDto);
  }

  @Get("")
  findAll() {
    return this.usersService.findAll();
  }

  @Get('detail-user')
  findUser(@Query('id') id?: string, @Query('username') username?: string) {
    return this.usersService.findUser({ id, username });
  }

  //- cho hết vào body kể cả id
  @Patch()
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
