import {
  CreateSubmissionDto,
  Judge0SubmissionRequest,
  Judge0SubmissionResponse,
  Judge0SubmissionStatus,
  Judge0TokenResponse,
  Problem,
  ProblemDocument,
  Submission,
  SubmissionDocument,
  TestCaseDocument,
  TestResult,
  UpdateSubmissionDto,
} from '@git-gud/entities';
import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { lastValueFrom, catchError, interval, switchMap, tap, takeWhile } from 'rxjs';
import { JUDGE0_API } from '../constants';

@Injectable()
export class SubmissionService {
  private readonly logger = new Logger(SubmissionService.name);

  constructor(
    @InjectModel(Submission.name) private submissionModel: Model<SubmissionDocument>,
    @InjectModel(Problem.name) private problemModel: Model<ProblemDocument>,
    private http: HttpService
  ) {}

  async makeSubmission(
    submissionId: string | null,
    submissionDto: CreateSubmissionDto | UpdateSubmissionDto,
    createOrUpdate: 'Create' | 'Update'
  ) {
    if (submissionId === null) {
      submissionId = new Types.ObjectId().toString();
    }

    console.log(submissionDto.problem, submissionDto);

    const { testCases } = await this.problemModel
      .findById<{ testCases: TestCaseDocument[] }>(submissionDto.problem, { testCases: true })
      .exec();

    const judge0Submissions = testCases.map(
      (testCase) =>
        ({
          source_code: Buffer.from(submissionDto.code, 'utf8').toString('base64'),
          language_id: submissionDto.programmingLanguage,
          stdin: Buffer.from(testCase.input, 'utf8').toString('base64'),
          expected_output: Buffer.from(testCase.desiredOutput, 'utf8').toString('base64'),
          cpu_time_limit: testCase.cpuTimeLimit,
          memory_limit: testCase.memoryUsageLimit,
        } as Judge0SubmissionRequest)
    );

    this.logger.log('Sending submissions to Judge0', judge0Submissions);

    const { data: tokenResponses } = await lastValueFrom(
      this.http
        .post<Judge0TokenResponse[]>(JUDGE0_API + '/submissions/batch?base64_encoded=true', {
          submissions: judge0Submissions,
        })
        .pipe(
          catchError((e) => {
            console.log(e);
            throw new HttpException(e.response.data, e.response.status);
          })
        )
    );

    const tokens = tokenResponses.map((res) => res.token);

    const {
      data: { submissions: submissionResults },
    } = await lastValueFrom(
      interval(1500).pipe(
        switchMap(() =>
          this.http
            .get<{ submissions: Judge0SubmissionResponse[] }>(
              JUDGE0_API + '/submissions/batch?tokens=' + tokens.join(',') + '&base64_encoded=true'
            )
            .pipe(
              tap(({ data: { submissions } }) => {
                this.logger.log('Judge0 submission status', submissions);
              }),
              catchError((e) => {
                console.log(e);
                throw new HttpException(e.response?.data, e.response?.status);
              })
            )
        ),
        takeWhile(
          ({ data: { submissions } }) =>
            submissions.every(
              (submission) =>
                submission.status.id === Judge0SubmissionStatus.InQueue ||
                submission.status.id === Judge0SubmissionStatus.Processing
            ),
          true
        )
      )
    );

    submissionDto.testResults = submissionResults.map(
      (submissionResponse, index) =>
        ({
          testCase: new Types.ObjectId(testCases[index]._id),
          status: submissionResponse.status.id,
          time: submissionResponse.time,
          memory: submissionResponse.memory,
          message: submissionResponse.message
            ? Buffer.from(submissionResponse.message, 'base64').toString('utf8')
            : null,
          output: submissionResponse.stdout ? Buffer.from(submissionResponse.stdout, 'base64').toString('utf8') : null,
          stderr: submissionResponse.stderr ? Buffer.from(submissionResponse.stderr, 'base64').toString('utf8') : null,
          compileOutput: submissionResponse.compile_output
            ? decodeURIComponent(Buffer.from(submissionResponse.compile_output, 'base64').toString('utf8'))
            : null,
          cpuTimeLimitExceeded: testCases[index].cpuTimeLimit
            ? Number(submissionResponse.time) > testCases[index].cpuTimeLimit
            : false,
          memoryLimitExceeded: testCases[index].memoryUsageLimit
            ? submissionResponse.memory > testCases[index].memoryUsageLimit
            : false,
        } as TestResult)
    );

    const submissionDoc =
      createOrUpdate === 'Create'
        ? (async () => {
            const sub = await this.submissionModel.create(submissionDto);
            return await sub.save();
          })()
        : this.update(submissionId, submissionDto);

    return submissionDoc;
  }

  findOne(id: string) {
    return this.submissionModel.findById(id).exec();
  }

  update(id: string, updateSubmissionDto: UpdateSubmissionDto) {
    return this.submissionModel.findByIdAndUpdate(id, updateSubmissionDto, { returnDocument: 'after' }).exec();
  }

  remove(id: string) {
    return this.submissionModel.findByIdAndDelete(id, { returnDocument: 'after' }).exec();
  }

  async problemSolutions(problemId: string) {
    const submissions = await this.submissionModel
      .find({ problem: problemId })
      .populate('author')
      .populate('testResults.testCase')
      .lean()
      .exec();

    const { testCases } = await this.problemModel.findById(problemId);

    const solutions = submissions
      .filter((submission) =>
        submission.testResults.every((testResult) => testResult.status === Judge0SubmissionStatus.Accepted)
      )
      .map((submission) => {
        return {
          ...submission,
          testResults: submission.testResults.map((testResult) => ({
            ...testResult,
            testCase: testCases.find((testCase) => testCase._id.toString() === testResult.testCase.toString()),
          })),
        };
      })
      .sort((s1, s2) => {
        const timeSum1 = s1.testResults.reduce((acc, tr) => acc + Number(tr.time), 0);
        const timeSum2 = s2.testResults.reduce((acc, tr) => acc + Number(tr.time), 0);
        return timeSum1 - timeSum2;
      });

    return solutions;
  }
}
