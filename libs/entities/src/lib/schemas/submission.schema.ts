import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import { TestResult } from './test-result';
import { User } from './user.schema';

export type SubmissionDocument = HydratedDocument<Submission>;

@Schema({ timestamps: true })
export class Submission {
  @IsNotEmpty()
  @Prop({ type: Types.ObjectId, ref: User.name })
  author: User;

  @IsNotEmpty()
  @Prop()
  code: string;

  @IsNotEmpty()
  @Prop({ type: Number, required: true })
  programmingLanguage: number;

  @Prop({
    type: [
      {
        ...TestResult,
      },
    ],
  })
  testResults: TestResult[];
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
