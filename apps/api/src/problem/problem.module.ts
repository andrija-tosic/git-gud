import { Module } from '@nestjs/common';
import { ProblemService } from './problem.service';
import { ProblemController } from './problem.controller';
import { Problem, ProblemSchema } from '@git-gud/entities';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [MongooseModule.forFeature([{ name: Problem.name, schema: ProblemSchema }]), HttpModule],
  controllers: [ProblemController],
  providers: [ProblemService],
})
export class ProblemModule {}
