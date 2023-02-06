import { Types } from 'mongoose';

export class TestResult {
  testCase: Types.ObjectId;
  passed: boolean;
  output: string;
  time: string;
  memory: number;
  message?: string;
  compileOutput?: string;
  cpuTimeLimitExceeded: boolean;
  memoryLimitExceeded: boolean;
}
