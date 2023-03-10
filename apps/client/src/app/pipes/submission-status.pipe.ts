import { Pipe, PipeTransform } from '@angular/core';
import { Judge0SubmissionStatus } from '@git-gud/entities';

@Pipe({
  name: 'submissionStatus',
})
export class SubmissionStatusPipe implements PipeTransform {
  transform(value: Judge0SubmissionStatus): string {
    //TODO: webpack enum bug

    switch (value) {
      case 3:
        return 'Accepted ✅';
      case 4:
        return 'Wrong answer 🚫';
      case 6:
        return 'Compilation error ⚠️';
      case 11:
        return 'Runtime Error ⚠️';
      default:
        return '';
    }
  }
}
``;
