import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nullableValue'
})
export class NullableValuePipe implements PipeTransform {

  transform(value: number[], ...args: unknown[]): string {
    console.log(value);
    return value.join('');
  }

}
