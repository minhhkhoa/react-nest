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
import { ResponseMessage, userDecorator } from 'src/decorator/customize';
import { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage('Create a new User')
  create(@Body() createUserDto: CreateUserDto, @userDecorator() user: IUser) {
    //- @Body() === req.body
    return this.usersService.create(createUserDto, user);
  }

  @Get('')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('detail-user')
  findUser(@Query('id') id?: string, @Query('username') username?: string) {
    return this.usersService.findUser({ id, username });
  }

  //- cho hết vào body kể cả id
  @Patch()
  @ResponseMessage('Update a User')
  update(@Body() updateUserDto: UpdateUserDto, @userDecorator() user: IUser) {
    return this.usersService.update(updateUserDto, user);
  }

  @Delete('/:id')
  @ResponseMessage('Delete a User')
  remove(@Param('id') id: string, @userDecorator() user: IUser) {
    return this.usersService.remove(id, user);
  }
}
