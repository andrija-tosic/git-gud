import { Pipe, PipeTransform } from '@angular/core';
import { Difficulty } from '@git-gud/entities';

@Pipe({
  name: 'problemDifficulty',
})
export class ProblemDifficultyPipe implements PipeTransform {
  transform(value: Difficulty, ...args: unknown[]): string {
    //TODO:
    switch (value) {
      case 0:
        return 'Easy';
      case 1:
        return 'Medium';
      case 2:
        return 'Hard';
      default:
        return '';
    }
  }
}
