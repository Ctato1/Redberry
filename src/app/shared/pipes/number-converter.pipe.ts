import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberConverter'
})
export class NumberConverterPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): unknown {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

}
