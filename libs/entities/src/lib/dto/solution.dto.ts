import { Submission } from '../schemas';

export type Solution = Omit<Submission, 'author' | 'testResults'>;
