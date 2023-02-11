import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ProblemModule } from './problem/problem.module';
import { MONGODB_CONN_STRING, MONGODB_NAME } from './constants';
import { SubmissionModule } from './submission/submission.module';

@Module({
  imports: [
    MongooseModule.forRoot(MONGODB_CONN_STRING, { dbName: MONGODB_NAME }),
    UserModule,
    ProblemModule,
    SubmissionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
