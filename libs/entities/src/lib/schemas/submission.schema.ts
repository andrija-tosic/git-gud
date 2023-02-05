import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type SubmissionDocument = HydratedDocument<Submission>;

@Schema()
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
        testCase: Types.ObjectId,
        passed: Boolean,
      },
    ],
  })
  testResults: {
    testCase: Types.ObjectId;
    passed: boolean;
  }[];
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
