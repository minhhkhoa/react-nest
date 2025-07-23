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
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { ResponseMessage, skipCheckPermission, userDecorator } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('subscribers')
@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @Post()
  @ResponseMessage('Create subscriber successfully')
  create(
    @Body() createSubscriberDto: CreateSubscriberDto,
    @userDecorator() user: IUser,
  ) {
    return this.subscribersService.create(createSubscriberDto, user);
  }

  @Post("skills")
  @ResponseMessage('Get subscriber skill')
  @skipCheckPermission()
  getUserSkills(@userDecorator() user: IUser) {
    return this.subscribersService.getUserSkills(user);
  }

  @Get()
  @ResponseMessage('findAll subscriber successfully')
  findAll(
    @Query('current') page: number,
    @Query('pageSize') limit: number,
    @Query() query: string,
  ) {
    return this.subscribersService.findAll(page, limit, query);
  }

  @Get(':id')
  @ResponseMessage('FindOne subscriber successfully')
  findOne(@Param('id') id: string) {
    return this.subscribersService.findOne(id);
  }

  @Patch()
  @skipCheckPermission()
  @ResponseMessage('Update subscriber successfully')
  update(
    @Body() updateSubscriberDto: UpdateSubscriberDto,
    @userDecorator() user: IUser,
  ) {
    return this.subscribersService.update(updateSubscriberDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete subscriber successfully')
  remove(@Param('id') id: string, @userDecorator() user: IUser) {
    return this.subscribersService.remove(id, user);
  }
}
