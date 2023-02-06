import {
  Judge0SubmissionRequest,
  Judge0SubmissionResponse,
  Judge0TokenResponse,
  Judge0SubmissionStatus,
  Problem,
  ProblemDocument,
  TestCaseDocument,
  TestResult,
  ProblemSearchFilters,
} from '@git-gud/entities';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { CreateSubmissionDto, UpdateSubmissionDto, CreateProblemDto, UpdateProblemDto } from '@git-gud/entities';
import { HttpService } from '@nestjs/axios';
import { filter, map, repeat, from, switchMap, take, defer, catchError } from 'rxjs';
import { JUDGE0_API } from '../constants';

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
    return this.problemModel.findById(id).exec();
  }

  update(id: string, updateProblemDto: UpdateProblemDto) {
    const problem = this.problemModel
      .findByIdAndUpdate(id, updateProblemDto, {
        returnDocument: 'after',
      })
      .exec();

    return problem;
  }

  remove(id: string) {
    return this.problemModel.findByIdAndDelete(id);
  }

  makeSubmission(
    id: string,
    submissionId: string | null,
    submissionDto: CreateSubmissionDto | UpdateSubmissionDto,
    createOrUpdate: 'Create' | 'Update'
  ) {
    if (submissionId === null) {
      submissionId = new Types.ObjectId().toString();
    }

    const testCases = defer(() =>
      from(this.problemModel.findById<{ testCases: TestCaseDocument[] }>(id, { testCases: true }))
    );

    return testCases.pipe(
      map((result) => result.testCases),
      switchMap((testCases) => {
        this.logger.log(
          testCases.map(
            (testCase) =>
              ({
                source_code: Buffer.from(submissionDto.code, 'ascii').toString('base64'),
                language_id: submissionDto.programmingLanguage,
                stdin: Buffer.from(testCase.input, 'ascii').toString('base64'),
                expected_output: Buffer.from(testCase.desiredOutput, 'ascii').toString('base64'),
                cpu_time_limit: testCase.cpuTimeLimit,
                memory_limit: testCase.memoryUsageLimit,
              } as Judge0SubmissionRequest)
          ),
          'Sending submissions to Judge0'
        );
        return this.http
          .post<Judge0TokenResponse[]>(JUDGE0_API + '/submissions/batch?base64_encoded=true', {
            submissions: testCases.map(
              (testCase) =>
                ({
                  source_code: Buffer.from(submissionDto.code, 'ascii').toString('base64'),
                  language_id: submissionDto.programmingLanguage,
                  stdin: Buffer.from(testCase.input, 'ascii').toString('base64'),
                  expected_output: Buffer.from(testCase.desiredOutput, 'ascii').toString('base64'),
                  cpu_time_limit: 0, // TODO: testCase.cpuTimeLimit,
                  memory_limit: testCase.memoryUsageLimit,
                } as Judge0SubmissionRequest)
            ),
          })
          .pipe(
            map((axiosResponse) => ({
              axiosResponse,
              testCases,
            })),
            catchError((e) => {
              this.logger.error(e.response.data, e.response.status);
              throw new HttpException(e.response.data, e.response.status);
            })
          );
      }),
      map(({ axiosResponse, testCases }) => {
        return { tokens: axiosResponse.data.map((res) => res.token), testCases };
      }),
      switchMap(({ tokens, testCases }) =>
        this.http
          .get<{ submissions: Judge0SubmissionResponse[] }>(
            JUDGE0_API + '/submissions/batch?tokens=' + tokens.join(',') + '&base64_encoded=true'
          )
          .pipe(
            repeat({ delay: 1500 }),
            filter((results) => {
              this.logger.log(
                results.data.submissions.map((res) => res.status),
                'Judge0 submission status'
              );
              return results.data.submissions.every(
                (result) =>
                  result.status.id !== Judge0SubmissionStatus.InQueue &&
                  result.status.id !== Judge0SubmissionStatus.Processing
              );
            }),
            take(1),
            map((axiosResponse) => ({ axiosResponse, testCases })),
            catchError((e) => {
              this.logger.error(e.response?.data, e.response?.status);
              throw new HttpException(e.response?.data, e.response?.status);
            })
          )
      ),
      map(({ axiosResponse, testCases }) => ({ response: axiosResponse.data, testCases })),
      switchMap(({ response, testCases }) => {
        console.log('response.submissions', response.submissions);
        submissionDto.testResults = response.submissions.map((submissionResponse, index) => {
          return {
            testCase: new Types.ObjectId(testCases[index]._id),
            passed: submissionResponse.status.id === Judge0SubmissionStatus.Accepted,
            time: submissionResponse.time,
            memory: submissionResponse.memory,
            message: submissionResponse.message,
            output: submissionResponse.stdout
              ? Buffer.from(submissionResponse.stdout, 'base64').toString('ascii')
              : null,
            compileOutput: submissionResponse.compile_output
              ? decodeURIComponent(Buffer.from(submissionResponse.compile_output, 'base64').toString('ascii'))
              : null,
            cpuTimeLimitExceeded: Number(submissionResponse.time) > testCases[index].cpuTimeLimit,
            memoryLimitExceeded: submissionResponse.memory > testCases[index].memoryUsageLimit,
          } as TestResult;
        });

        const problemDoc =
          createOrUpdate === 'Create'
            ? this.findProblemForSubmissionCreate(id, submissionId, submissionDto)
            : this.findProblemForSubmissionUpdate(id, submissionId, submissionDto);

        return defer(() => from(problemDoc));
      })
    );
  }

  private findProblemForSubmissionCreate(id: string, submissionId: string, submissionDto: CreateSubmissionDto) {
    return this.problemModel
      .findOneAndUpdate(
        {
          _id: id,
          'submissions.programmingLanguage': {
            $ne: submissionDto.programmingLanguage,
          },
        },
        { $push: { submissions: { _id: new Types.ObjectId(submissionId), ...submissionDto } } },
        {
          returnDocument: 'after',
        }
      )
      .exec();
  }

  private findProblemForSubmissionUpdate(id: string, submissionId: string, submissionDto: UpdateSubmissionDto) {
    return this.problemModel
      .findOneAndUpdate(
        {
          _id: id,
          'submissions._id': submissionId,
          'submissions.programmingLanguage': submissionDto.programmingLanguage,
        },
        { $set: { 'submissions.$[element]': submissionDto } },
        {
          arrayFilters: [{ 'element.programmingLanguage': { $eq: submissionDto.programmingLanguage } }],
          returnDocument: 'after',
        }
      )
      .exec();
  }

  deleteSubmission(id: string, submissionId: string) {
    return this.problemModel
      .findOneAndUpdate({ _id: id, 'submissions._id': submissionId }, { $pull: { submissions: { _id: submissionId } } })
      .exec();
  }

  searchProblems(searchFilters: ProblemSearchFilters) {
    if (
      searchFilters.title?.length === 0 &&
      searchFilters.difficulties?.length === 0 &&
      searchFilters.tags?.length === 0
    ) {
      return this.problemModel.find().limit(50).exec();
    }

    const filterQuery: FilterQuery<unknown> = {};

    if (searchFilters.title?.trim().length > 0) {
      filterQuery.$text = { $search: searchFilters.title, $caseSensitive: false };
    }

    if (searchFilters.difficulties?.length > 0) {
      filterQuery.difficulty = { $in: searchFilters.difficulties };
    }

    if (searchFilters.tags?.length > 0) {
      filterQuery.tags = { $in: searchFilters.tags };
    }

    return this.problemModel.find(filterQuery).exec();
  }

  randomProblem(searchFilters: ProblemSearchFilters) {
    const filterQuery: FilterQuery<unknown> = {};

    if (searchFilters.title?.trim().length > 0) {
      filterQuery.$text = { $search: searchFilters.title, $caseSensitive: false };
    }

    if (searchFilters.difficulties?.length > 0) {
      filterQuery.difficulty = { $in: searchFilters.difficulties };
    }

    if (searchFilters.tags?.length > 0) {
      filterQuery.tags = { $in: searchFilters.tags };
    }

    return this.problemModel
      .aggregate([
        {
          $match: filterQuery,
        },
        {
          $sample: {
            size: 1,
          },
        },
      ])
      .exec();
  }

  upvoteProblem(id: string) {
    return this.problemModel
      .findByIdAndUpdate(
        id,
        {
          $inc: { helpfulCount: 1 },
        },
        { returnDocument: 'after' }
      )
      .exec();
  }

  removeProblemUpvote(id: string) {
    return this.problemModel
      .findByIdAndUpdate(
        id,
        {
          $inc: { helpfulCount: 1 },
        },
        { returnDocument: 'after' }
      )
      .exec();
  }

  downvoteProblem(id: string) {
    return this.problemModel
      .findByIdAndUpdate(
        id,
        {
          $dec: { unhelpfulCount: 1 },
        },
        { returnDocument: 'after' }
      )
      .exec();
  }

  removeProblemDownvote(id: string) {
    return this.problemModel
      .findByIdAndUpdate(
        id,
        {
          $dec: { unhelpfulCount: 1 },
        },
        { returnDocument: 'after' }
      )
      .exec();
  }

  problemSolutions(id: string) {
    return this.problemModel.findOne({ _id: id, 'submissions.testResults.passed': true }, { submissions: true }).exec();
  }
}
