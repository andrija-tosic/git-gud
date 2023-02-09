import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'messageErrorStatus',
})
export class MessageErrorStatusPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'Exited with error status 137':
        return 'Memory usage limit exceeded';

      default:
        return value;
    }
  }
}
