import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, maxLength: number = 44): string {
    if (value.length > maxLength) {
      return value.substring(0, maxLength - 3) + '...';
    }
    return value;
  }
}