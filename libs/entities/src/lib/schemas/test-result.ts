import { Types } from 'mongoose';
import { Judge0SubmissionStatus } from '../types';

export class TestResult {
  testCase: Types.ObjectId;
  status: Judge0SubmissionStatus;
  output: string;
  time: string;
  memory: number;
  message?: string;
  compileOutput?: string;
  cpuTimeLimitExceeded: boolean;
  memoryLimitExceeded: boolean;
}
