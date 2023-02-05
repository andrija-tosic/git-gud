import { PartialType } from '@nestjs/mapped-types';
import { CreateSubmisionDto } from './create-submission.dto';

export class UpdateSubmisionDto extends PartialType(CreateSubmisionDto) {}
