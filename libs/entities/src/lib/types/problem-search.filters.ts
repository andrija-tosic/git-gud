import { Difficulty } from './difficulty.enum';
import { Tag } from './tag.enum';

export interface ProblemSearchFilters {
  title: string;
  difficulties: Difficulty[];
  tags: (typeof Tag)[];
}
