import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayAverage',
})
export class ArrayAveragePipe implements PipeTransform {
  transform(items: any[], attr: string): unknown {
    const sum = items.reduce((acc: any, el: any) => acc + Number(el[attr]), 0);
    return sum / items.length;
  }
}
