import { Submission, TestResult } from '../schemas';
import { PickType } from '@nestjs/mapped-types';

export class CreateSubmissionDto extends PickType(Submission, ['problem', 'author', 'code', 'programmingLanguage']) {
  testResults?: TestResult[];
}
