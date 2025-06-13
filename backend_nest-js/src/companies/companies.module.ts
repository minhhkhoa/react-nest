import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './schemas/company.schema';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService],
  imports: [
    //- Đăng ký schema CompanySchema với Mongoose để sử dụng trong service
    //- NestJS sẽ tự sinh ra một provider cho model Company
    //- @InjectModel(Company.name) ở service sẽ lấy đúng provider đó
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
  ],
})
export class CompaniesModule {}
