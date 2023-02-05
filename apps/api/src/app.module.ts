import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ProblemModule } from './problem/problem.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://andrija:iYSzBianDeThIRek@git-gud-cluster.mdhmwey.mongodb.net/?retryWrites=true&w=majority',
      { dbName: 'git-gud-db' }
    ),
    UserModule,
    ProblemModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
