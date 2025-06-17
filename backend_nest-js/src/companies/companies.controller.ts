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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import {  ParseIntPipeCustom } from './dto/ParseInt.pipe';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ResponseMessage("Create a new company")
  create(@Body() createCompanyDto: CreateCompanyDto, @User() user: IUser) {
    return this.companiesService.createCompany(createCompanyDto, user);
  }

  @Get()
  @ResponseMessage("Get list companies with paginate")
  findAll(
    //- vì trong main mình có config pipe global nên nó chạy trước cả pipe custom mình viết dưới này. Nếu để type tham số là string thì nó sẽ không chạy pipe global. Còn nếu để number thì nó sẽ chạy pipe global trước khi chạy pipe custom, đó là cách chạy của NestJS.
    @Query('page', new ParseIntPipeCustom()) page: number,
    @Query('limit', new ParseIntPipeCustom()) limit: number,
    @Query() query: string,
  ) {
    return this.companiesService.findAll(page, limit, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(+id);
  }

  //- update Companies
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @User() user: IUser,
  ) {
    return this.companiesService.update(id, updateCompanyDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.companiesService.remove(id, user);
  }
}
