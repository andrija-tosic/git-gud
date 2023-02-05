import {
  Judge0SubmissionRequest,
  Judge0SubmissionResponse,
  Judge0TokenResponse,
  Judge0SubmissionStatus,
  Problem,
  ProblemDocument,
  TestCaseDocument,
} from '@git-gud/entities';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProblemDto } from './dto/create-problem.dto';
import { CreateSubmisionDto } from './dto/create-submission.dto';
import { UpdateSubmisionDto as UpdateSubmissionDto } from './dto/update-submission.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { HttpService } from '@nestjs/axios';
import { filter, map, repeat, from, switchMap, take, defer } from 'rxjs';

@Injectable()
export class ProblemService {
  private readonly logger = new Logger(ProblemService.name);

  constructor(
    @InjectModel(Problem.name) private problemModel: Model<ProblemDocument>,
    private readonly http: HttpService
  ) {}

  async create(createProblemDto: CreateProblemDto) {
    const problem = await this.problemModel.create(createProblemDto);
    return problem.save();
  }

  findOne(id: string) {
    return this.problemModel.findById(id);
  }

  update(id: string, updateProblemDto: UpdateProblemDto) {
    const problem = this.problemModel.findByIdAndUpdate(id, updateProblemDto, {
      returnDocument: 'after',
    });
    return problem;
  }

  remove(id: string) {
    return this.problemModel.findByIdAndDelete(id);
  }

  createSubmission(id: string, createSubmissionDto: CreateSubmisionDto) {
    const submissionId = new Types.ObjectId();

    const testCases = defer(() =>
      from(this.problemModel.findById<{ testCases: TestCaseDocument[] }>(id, { testCases: true }))
    );

    return testCases.pipe(
      map((result) => result.testCases),
      switchMap((testCases) => {
        return this.http
          .post<Judge0TokenResponse[]>(`http://localhost:2358/submissions/batch`, {
            submissions: testCases.map(
              (testCase) =>
                ({
                  source_code: createSubmissionDto.code,
                  language_id: createSubmissionDto.programmingLanguage,
                  stdin: testCase.input,
                  expected_output: testCase.desiredOutput,
                  cpu_time_limit: testCase.cpuTimeLimit,
                  memory_limit: testCase.memoryUsageLimit,
                } as Judge0SubmissionRequest)
            ),
          })
          .pipe(
            map((axiosResponse) => ({
              axiosResponse,
              testCases,
            }))
          );
      }),
      map(({ axiosResponse, testCases }) => {
        return { tokens: axiosResponse.data.map((res) => res.token), testCases };
      }),
      switchMap(({ tokens, testCases }) =>
        this.http
          .get<{ submissions: Judge0SubmissionResponse[] }>(
            `http://localhost:2358/submissions/batch?tokens=${tokens.join(',')}`
          )
          .pipe(
            repeat({ delay: 1000 }),
            filter((results) => {
              this.logger.log(
                results.data.submissions.map((res) => res.status),
                'Judge0 submission'
              );
              return results.data.submissions.every(
                (result) =>
                  result.status.id === Judge0SubmissionStatus.Accepted ||
                  result.status.id === Judge0SubmissionStatus.WrongAnswer
              );
            }),
            take(1),
            map((axiosResponse) => ({ axiosResponse, testCases }))
          )
      ),
      map(({ axiosResponse, testCases }) => ({ response: axiosResponse.data, testCases })),
      switchMap(({ response, testCases }) => {
        createSubmissionDto.testResults = response.submissions.map((submissionResponse, index) => {
          return {
            testCase: new Types.ObjectId(testCases[index]._id),
            passed: submissionResponse.status.description === 'Accepted',
          };
        });

        const docs = this.problemModel
          .findOneAndUpdate(
            {
              _id: id,
              'submissions.programmingLanguage': {
                $ne: createSubmissionDto.programmingLanguage,
              },
            },
            { $push: { submissions: { _id: submissionId._id, ...createSubmissionDto } } },
            {
              returnDocument: 'after',
            }
          )
          .exec();

        return defer(() => from(docs));
      })
    );
  }

  updateSubmission(id: string, submissionId: string, updateSubmissionDto: UpdateSubmissionDto) {
    const problem = this.problemModel.findOneAndUpdate(
      { _id: id, 'submissions._id': submissionId },
      { $set: { 'submissions.$[element]': updateSubmissionDto } },
      {
        arrayFilters: [
          { 'element.programmingLanguage': { $eq: updateSubmissionDto.programmingLanguage } },
        ],
        returnDocument: 'after',
      }
    );

    return problem;
  }

  deleteSubmission(id: string, submissionId: string) {
    return this.problemModel.findOneAndUpdate(
      { _id: id, 'submissions._id': submissionId },
      { $pull: { submissions: { _id: submissionId } } }
    );
  }
}
