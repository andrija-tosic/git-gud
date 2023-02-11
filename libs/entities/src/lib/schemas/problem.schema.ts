import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import { Tag } from '../types';
import { Difficulty } from '../types/difficulty.enum';
import { Submission, SubmissionSchema } from './submission.schema';
import { TestCase, TestCaseSchema } from './testcase.schema';

export type ProblemDocument = HydratedDocument<Problem>;

@Schema({ timestamps: true })
export class Problem {
  _id: string;

  @IsNotEmpty()
  @Prop({ required: true })
  title: string;

  @IsNotEmpty()
  @Prop({ required: true })
  text: string;

  @IsNotEmpty()
  @Prop({ type: [Number], required: true })
  programmingLanguagesIds: Types.Array<number>;

  @IsNotEmpty()
  @Prop({ type: Number, enum: Difficulty, required: true })
  difficulty: Difficulty;

  @IsNotEmpty()
  @Prop({ type: [String], enum: Tag, required: true })
  tags: Tag[];

  @IsNotEmpty()
  @Prop({ type: [TestCaseSchema], required: true })
  testCases: Types.Array<TestCase>;

  @Prop({ type: [SubmissionSchema] })
  submissions: Types.Array<Submission>;
}

export const ProblemSchema = SchemaFactory.createForClass(Problem);

// ProblemSchema.index({ title: 'text' });
ProblemSchema.index({ difficulty: 1 });
ProblemSchema.index({ tags: 1 });
