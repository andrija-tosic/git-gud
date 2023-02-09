import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsNotEmpty } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';

export type TestCaseDocument = HydratedDocument<TestCase>;

@Schema()
export class TestCase {
  _id: Types.ObjectId;

  @IsNotEmpty()
  @Prop({ required: true })
  input: string;

  @IsNotEmpty()
  @Prop({ required: true })
  desiredOutput: string;

  @Prop()
  explanation: string;

  @Prop({ type: Number })
  cpuTimeLimit: number;

  @Prop({ type: Number })
  memoryUsageLimit: number;
}

export const TestCaseSchema = SchemaFactory.createForClass(TestCase);
