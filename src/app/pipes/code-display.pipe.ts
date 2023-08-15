import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'codeDisplay'
})
export class CodeDisplayPipe implements PipeTransform {

  transform(value: number[], ...args: unknown[]): string {
    console.log(value);
    return value.join('');
  }

}
