import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { Connection } from 'mongoose';
import { CompaniesModule } from './companies/companies.module';
import { JobsModule } from './jobs/jobs.module';
import { FilesModule } from './files/files.module';
import { ResumesModule } from './resumes/resumes.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { DatabasesModule } from './databases/databases.module';
import { SubscribersModule } from './subscribers/subscribers.module';
import { MailModule } from './mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    //- cron job
    ScheduleModule.forRoot(),

    //- rate limit
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 3,
        },
      ],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
        maxPoolSize: 20, //- tăng connection pool (mặc định 5)
        serverSelectionTimeoutMS: 5000, //- nếu connect tới server quá 5s thì báo lỗi
        socketTimeoutMS: 45000, //- timeout
        connectionFactory: (connection: Connection) => {
          //- điều này giúp sử dụng soft delete
          connection.plugin(softDeletePlugin);
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    //- configModule giúp sử dụng file .env
    ConfigModule.forRoot({
      isGlobal: true, //---> This is a global configuration để có thể sử dụng cònigModule trong các module khác
    }),
    UsersModule,
    AuthModule,
    CompaniesModule,
    JobsModule,
    FilesModule,
    ResumesModule,
    PermissionsModule,
    RolesModule,
    DatabasesModule,
    SubscribersModule,
    MailModule,
    HealthModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
