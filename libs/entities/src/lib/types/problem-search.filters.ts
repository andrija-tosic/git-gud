import { Difficulty } from './difficulty.enum';
import { Tag } from './tag.enum';

export type ProblemSearchFilters = {
  title?: string;
  difficulties?: Difficulty[];
  tags?: (typeof Tag)[];
};
