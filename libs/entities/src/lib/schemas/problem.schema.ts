import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import { Difficulty } from '../types/difficulty.enum';
import { Submission, SubmissionSchema } from './submission.schema';
import { TestCase, TestCaseSchema } from './testcase.schema';

export type ProblemDocument = HydratedDocument<Problem>;

@Schema()
export class Problem {
  @IsNotEmpty()
  @Prop({ required: true })
  text: string;

  @IsNotEmpty()
  @Prop({ type: [Number], required: true })
  programmingLanguagesIds: Types.Array<number>;

  @IsNotEmpty()
  @Prop({ type: Number, enum: Difficulty, required: true })
  difficulty: number;

  @Prop({ type: Number, default: 0 })
  helpfulCount: number;

  @Prop({ type: Number, default: 0 })
  unhelpfulCount: number;

  @IsNotEmpty()
  @Prop({ type: [TestCaseSchema], required: true })
  testCases: Types.Array<TestCase>;

  @Prop({ type: [SubmissionSchema] })
  submissions: Types.Array<Submission>;
}

export const ProblemSchema = SchemaFactory.createForClass(Problem);