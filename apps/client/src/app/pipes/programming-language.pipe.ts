import { Pipe, PipeTransform } from '@angular/core';
import { PROGRAMMING_LANGUAGES } from '../constants';

@Pipe({
  name: 'programmingLanguage',
})
export class ProgrammingLanguagePipe implements PipeTransform {
  transform(id: number, ...args: unknown[]): string {
    // TODO.......

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return PROGRAMMING_LANGUAGES.find((l) => l.id == id)!.name;
  }
}
