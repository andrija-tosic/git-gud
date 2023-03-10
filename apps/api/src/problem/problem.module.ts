import { Module } from '@nestjs/common';
import { ProblemService } from './problem.service';
import { ProblemController } from './problem.controller';
import { Problem, ProblemSchema, Submission, SubmissionSchema } from '@git-gud/entities';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Submission.name, schema: SubmissionSchema },
      { name: Problem.name, schema: ProblemSchema },
    ]),
  ],
  controllers: [ProblemController],
  providers: [ProblemService],
})
export class ProblemModule {}
